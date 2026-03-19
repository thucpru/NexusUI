/**
 * AiGenerationProcessor — Bull queue processor for generation jobs.
 * Handles: model resolution, prompt building, AI call, output parsing,
 * credit deduction (via CreditMeteringService), Socket.IO events,
 * retry & refund on final failure.
 *
 * Credit deduction delegates to CreditMeteringService which uses
 * SELECT FOR UPDATE to prevent double-spend on concurrent jobs.
 */
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { DatabaseService } from '../../database/database-service';
import { ModelRegistryService } from '../model-registry/model-registry-service';
import { AiProviderFactory } from './providers/ai-provider-factory';
import { PromptBuilderService, type Framework } from './prompt-builder-service';
import { DesignSystemContextBuilder } from './design-system-context-builder';
import { OutputParserService } from './output-parser-service';
import { FigmaNodeConverterService } from './figma-node-converter-service';
import { CreditMeteringService } from '../billing/credit-metering.service';
import { RealtimeGateway } from '../../gateway/realtime-gateway';
import { GenerationStatus } from '@nexusui/database';
import { GENERATION_QUEUE } from './ai-generation-service';
import type { GenerationJobData } from './ai-generation-service';
import type { DesignSystemSnapshot } from './design-system-context-builder';

@Processor(GENERATION_QUEUE)
export class AiGenerationProcessor {
  private readonly logger = new Logger(AiGenerationProcessor.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly modelRegistry: ModelRegistryService,
    private readonly providerFactory: AiProviderFactory,
    private readonly promptBuilder: PromptBuilderService,
    private readonly dsContextBuilder: DesignSystemContextBuilder,
    private readonly outputParser: OutputParserService,
    private readonly figmaConverter: FigmaNodeConverterService,
    private readonly creditMetering: CreditMeteringService,
    private readonly gateway: RealtimeGateway,
  ) {}

  @Process()
  async processGeneration(job: Job<GenerationJobData>): Promise<void> {
    const { generationId, userId } = job.data;
    this.logger.log(`Processing generation: ${generationId} (attempt ${job.attemptsMade + 1})`);

    try {
      await this.runGeneration(generationId, userId);
    } catch (err) {
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 3);
      if (isFinalAttempt) {
        await this.handleFinalFailure(generationId, userId, (err as Error).message);
      } else {
        this.logger.warn(`Generation ${generationId} failed (attempt ${job.attemptsMade + 1}), will retry`);
      }
      throw err; // Re-throw to trigger Bull retry
    }
  }

  private async runGeneration(generationId: string, userId: string): Promise<void> {
    // 1. Load generation record
    const generation = await this.db.client.generation.findUnique({
      where: { id: generationId },
    });
    if (!generation) throw new Error(`Generation not found: ${generationId}`);

    // 2. Mark as PROCESSING + emit status
    await this.db.client.generation.update({
      where: { id: generationId },
      data: { status: GenerationStatus.PROCESSING },
    });
    this.gateway.emitGenerationStatus({
      generationId,
      projectId: generation.projectId,
      status: 'PROCESSING',
      progress: 10,
    });

    // 3. Load model with decrypted key
    const model = await this.modelRegistry.getModelWithDecryptedKey(generation.aiModelId);

    // 4. Build design system snapshot + system prompt
    const snapshot = await this.dsContextBuilder.buildSnapshot(generation.projectId);
    const framework = generation.framework as Framework;
    const systemPrompt = this.promptBuilder.buildSystemPrompt(snapshot, framework);
    const userPrompt = this.promptBuilder.buildUserPrompt(generation.prompt, generation.variantCount);

    this.gateway.emitGenerationStatus({
      generationId,
      projectId: generation.projectId,
      status: 'PROCESSING',
      progress: 30,
    });

    // 5. Call AI provider
    const provider = this.providerFactory.getProvider(model.provider, model.decryptedApiKey);
    const aiResponse = await provider.generate(userPrompt, systemPrompt, {
      providerModelId: model.providerModelId,
      maxTokens: 4096,
      temperature: 0.7,
    });

    this.logger.debug(
      `Generation ${generationId}: ${aiResponse.inputTokens} in / ${aiResponse.outputTokens} out tokens`,
    );

    this.gateway.emitGenerationStatus({
      generationId,
      projectId: generation.projectId,
      status: 'PROCESSING',
      progress: 70,
    });

    // 6. Parse output
    const parsedOutput = this.outputParser.parse(aiResponse.content);

    // 7. Convert to Figma nodes
    const figmaOutput = this.figmaConverter.convert(parsedOutput, framework);

    // 8. Build final output blob to store (cast to any for Prisma JSON field)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputBlob = { ...parsedOutput, figma: figmaOutput as any, snapshot: snapshot } as any;

    // 9. Deduct credits atomically via CreditMeteringService (SELECT FOR UPDATE — prevents double-spend)
    const newBalance = await this.creditMetering.deductCredits(userId, generation.creditsCost, generationId);

    // 10. Persist result and mark COMPLETED
    await this.db.client.generation.update({
      where: { id: generationId },
      data: {
        status: GenerationStatus.COMPLETED,
        output: outputBlob,
        completedAt: new Date(),
      },
    });

    // 11. Emit completion events
    this.gateway.emitGenerationStatus({
      generationId,
      projectId: generation.projectId,
      status: 'COMPLETED',
      progress: 100,
    });

    this.gateway.emitCreditsUpdated({
      userId,
      newBalance,
      delta: -generation.creditsCost,
    });

    this.logger.log(`Generation completed: ${generationId}`);
  }

  /** On final retry failure: mark FAILED, refund credits, emit events */
  private async handleFinalFailure(
    generationId: string,
    userId: string,
    errorMessage: string,
  ): Promise<void> {
    this.logger.error(`Generation ${generationId} final failure: ${errorMessage}`);

    const generation = await this.db.client.generation.findUnique({
      where: { id: generationId },
    });
    if (!generation) return;

    await this.db.client.generation.update({
      where: { id: generationId },
      data: { status: GenerationStatus.FAILED, errorMessage },
    });

    // Refund credits if they were already deducted (status was PROCESSING)
    if (generation.status === GenerationStatus.PROCESSING) {
      try {
        const newBalance = await this.creditMetering.refundCredits(
          userId,
          generation.creditsCost,
          generationId,
        );
        this.gateway.emitCreditsUpdated({ userId, newBalance, delta: generation.creditsCost });
      } catch (err) {
        this.logger.error(`Credit refund failed for generation ${generationId}:`, err);
      }
    }

    this.gateway.emitGenerationStatus({
      generationId,
      projectId: generation.projectId,
      status: 'FAILED',
    });
  }
}
