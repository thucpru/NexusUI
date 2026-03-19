/**
 * AiGenerationService — orchestrator for generation lifecycle.
 * Creates generation records, validates ownership, enqueues Bull jobs,
 * and handles credit pre-validation.
 */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { DatabaseService } from '../../database/database-service';
import { ModelRegistryService } from '../model-registry/model-registry-service';
import type { CreateGenerationInput } from './dto/create-generation-dto';
import type { GenerationResponseDto } from './dto/generation-response-dto';
import { GenerationStatus } from '@nexusui/database';

export const GENERATION_QUEUE = 'ai-generation';

export interface GenerationJobData {
  generationId: string;
  userId: string;
}

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly modelRegistry: ModelRegistryService,
    @InjectQueue(GENERATION_QUEUE) private readonly generationQueue: Queue<GenerationJobData>,
  ) {}

  /** Create generation record + enqueue Bull job after credit pre-check */
  async createGeneration(
    userId: string,
    input: CreateGenerationInput,
  ): Promise<GenerationResponseDto> {
    // Verify project ownership
    const project = await this.db.client.project.findFirst({
      where: { id: input.projectId, userId },
    });
    if (!project) throw new ForbiddenException('Project not found or access denied');

    // Get model cost (throws if model inactive/missing)
    const activeModels = await this.modelRegistry.listActiveModels();
    const model = activeModels.find((m) => m.id === input.modelId);
    if (!model) throw new NotFoundException('AI model not found or inactive');

    const creditsCost = model.creditCostPerRequest * input.variantCount;

    // Check user credit balance
    const user = await this.db.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.creditBalance < creditsCost) {
      throw new BadRequestException(
        `Insufficient credits: need ${creditsCost}, have ${user.creditBalance}`,
      );
    }

    // Snapshot current design system
    const designSystem = await this.db.client.designSystem.findUnique({
      where: { projectId: input.projectId },
    });
    const snapshot = designSystem ?? {};

    // Create generation record
    const generation = await this.db.client.generation.create({
      data: {
        projectId: input.projectId,
        userId,
        aiModelId: input.modelId,
        prompt: input.prompt,
        designSystemSnapshot: snapshot,
        status: GenerationStatus.QUEUED,
        creditsCost,
        variantCount: input.variantCount,
        framework: input.framework,
      },
    });

    // Enqueue job
    await this.generationQueue.add(
      { generationId: generation.id, userId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );

    this.logger.log(`Generation queued: ${generation.id} (model: ${model.name}, credits: ${creditsCost})`);
    return this.toDto(generation);
  }

  /** Poll generation status by ID — verifies ownership */
  async getGeneration(id: string, userId: string): Promise<GenerationResponseDto> {
    const generation = await this.db.client.generation.findUnique({ where: { id } });
    if (!generation) throw new NotFoundException('Generation not found');
    if (generation.userId !== userId) throw new ForbiddenException('Access denied');
    return this.toDto(generation);
  }

  /** List all generations for a project — verifies project ownership */
  async listProjectGenerations(
    projectId: string,
    userId: string,
  ): Promise<GenerationResponseDto[]> {
    const project = await this.db.client.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) throw new ForbiddenException('Project not found or access denied');

    const generations = await this.db.client.generation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return generations.map((g) => this.toDto(g));
  }

  private toDto(g: Awaited<ReturnType<typeof this.db.client.generation.findUniqueOrThrow>>): GenerationResponseDto {
    return {
      id: g.id,
      projectId: g.projectId,
      userId: g.userId,
      aiModelId: g.aiModelId,
      prompt: g.prompt,
      status: g.status,
      creditsCost: g.creditsCost,
      variantCount: g.variantCount,
      framework: g.framework,
      output: g.output,
      errorMessage: g.errorMessage,
      createdAt: g.createdAt,
      completedAt: g.completedAt,
    };
  }
}
