/**
 * RefactoringProcessor — Bull queue processor for UI refactoring jobs.
 * Handles: code fetch → style extraction → AI beautification →
 * validation → diff generation → DB update → WebSocket events.
 */
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import generate from '@babel/generator';
import * as parser from '@babel/parser';
import { diff_match_patch } from 'diff-match-patch';
import { RefactoringStatus } from '@prisma/client';
import { DatabaseService } from '../../database/database-service';
import { StyleExtractionService } from './style-extraction-service';
import { RefactorValidatorService } from './refactor-validator-service';
import { RealtimeGateway } from '../../gateway/realtime-gateway';
import { AiProviderFactory } from '../ai-generation/providers/ai-provider-factory';
import { ModelRegistryService } from '../model-registry/model-registry-service';
import { GitHubRepoReaderService } from '../github-sync/github-repo-reader.service';
import { REFACTORING_QUEUE_NAME } from '@nexusui/shared';
import type { RefactoringJobData } from './ui-refactoring-service';

/** Extract code blocks from AI markdown response */
function extractCodeBlock(content: string): string {
  const match = content.match(/```(?:tsx?|jsx?|typescript|javascript)?\n([\s\S]+?)```/);
  if (match?.[1]) return match[1].trim();
  return content.trim();
}

/** Derive added/removed classes by comparing className attributes */
function diffStyleChanges(before: string, after: string): { added: string[]; removed: string[]; modified: string[] } {
  const beforeClasses = new Set((before.match(/className="([^"]+)"/g) ?? []).map((m) => m.slice(11, -1)));
  const afterClasses = new Set((after.match(/className="([^"]+)"/g) ?? []).map((m) => m.slice(11, -1)));
  const added = [...afterClasses].filter((c) => !beforeClasses.has(c));
  const removed = [...beforeClasses].filter((c) => !afterClasses.has(c));
  return { added, removed, modified: [] };
}

@Processor(REFACTORING_QUEUE_NAME)
export class RefactoringProcessor {
  private readonly logger = new Logger(RefactoringProcessor.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly styleExtractor: StyleExtractionService,
    private readonly validator: RefactorValidatorService,
    private readonly gateway: RealtimeGateway,
    private readonly providerFactory: AiProviderFactory,
    private readonly modelRegistry: ModelRegistryService,
    private readonly repoReader: GitHubRepoReaderService,
  ) {}

  @Process()
  async processRefactoring(job: Job<RefactoringJobData>): Promise<void> {
    const { jobId, userId } = job.data;
    this.logger.log(`Processing refactoring job: ${jobId} (attempt ${job.attemptsMade + 1})`);

    try {
      await this.runRefactoring(jobId, userId);
    } catch (err) {
      const isFinal = job.attemptsMade + 1 >= (job.opts.attempts ?? 3);
      if (isFinal) await this.handleFailure(jobId, (err as Error).message);
      else this.logger.warn(`Job ${jobId} failed attempt ${job.attemptsMade + 1}, will retry`);
      throw err;
    }
  }

  private async runRefactoring(jobId: string, userId: string): Promise<void> {
    void userId; // used for audit context
    const refJob = await this.db.client.refactoringJob.findUnique({ where: { id: jobId } });
    if (!refJob) throw new Error(`Refactoring job not found: ${jobId}`);

    // 1. SCANNING — fetch source code from GitHub
    await this.updateStatus(jobId, RefactoringStatus.SCANNING);
    this.emitProgress(refJob.projectId, jobId, 'SCANNING', 10);

    const project = await this.db.client.project.findUnique({
      where: { id: refJob.projectId },
      include: { githubConnection: true },
    });
    if (!project?.githubConnection) throw new Error('No GitHub connection for project');

    const conn = project.githubConnection;
    const fileData = await this.repoReader.getFileContent(
      Number(conn.installationId),
      conn.repoOwner,
      conn.repoName,
      refJob.componentPath,
    );
    const beforeCode = fileData.content;

    // Persist beforeCode and move to BEAUTIFYING
    await this.db.client.refactoringJob.update({
      where: { id: jobId },
      data: { beforeCode, status: RefactoringStatus.BEAUTIFYING },
    });
    this.emitProgress(refJob.projectId, jobId, 'BEAUTIFYING', 30);

    // 2. Extract styling context for the AI prompt
    const { logicNodes } = this.styleExtractor.extractStyling(beforeCode);
    const styleIssues = this.styleExtractor.detectStyleIssues(beforeCode);

    // 3. Load AI model and call provider
    if (!refJob.aiModelId) throw new Error('No AI model assigned to job');
    const model = await this.modelRegistry.getModelWithDecryptedKey(refJob.aiModelId);

    // Build design system context if available
    const designSystem = await this.db.client.designSystem.findUnique({ where: { projectId: refJob.projectId } });
    const dsContext = designSystem
      ? `Design tokens: ${JSON.stringify({ colors: designSystem.colorTokens, spacing: designSystem.spacingTokens })}`
      : 'No design system configured — use Tailwind best practices.';

    const hookNames = logicNodes.map((n) => n.name).join(', ');
    const issueTypes = styleIssues.map((i) => i.type).join(', ');

    const systemPrompt =
      `You are a UI code refactoring assistant. Refactor the React component to fix style issues` +
      ` while preserving ALL business logic (${hookNames}). Return ONLY the complete refactored` +
      ` TypeScript/React code in a fenced code block. ${dsContext}`;
    const userPrompt =
      `Refactor this component to fix: ${issueTypes}.\n\n\`\`\`tsx\n${beforeCode}\n\`\`\``;

    const provider = this.providerFactory.getProvider(model.provider, model.decryptedApiKey);
    const aiResponse = await provider.generate(userPrompt, systemPrompt, {
      providerModelId: model.providerModelId,
      maxTokens: 4096,
      temperature: 0.3,
    });

    // 4. VALIDATING — parse AI output and validate
    await this.updateStatus(jobId, RefactoringStatus.VALIDATING);
    this.emitProgress(refJob.projectId, jobId, 'VALIDATING', 70);

    const rawAfterCode = extractCodeBlock(aiResponse.content);

    // Re-generate normalized code via Babel AST to ensure valid syntax
    let afterCode = rawAfterCode;
    try {
      const ast = parser.parse(rawAfterCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
      const genResult = generate(ast, { retainLines: false });
      afterCode = genResult.code;
    } catch {
      this.logger.warn(`Could not re-generate AST for job ${jobId}, using raw AI output`);
    }

    const logicValidation = this.validator.validateRefactoring(beforeCode, afterCode);
    const styleChanges = diffStyleChanges(beforeCode, afterCode);

    // 5. Generate diff preview using diff-match-patch
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(beforeCode, afterCode);
    dmp.diff_cleanupSemantic(diffs);
    const diffPreview = dmp.diff_prettyHtml(diffs);

    // 6. Persist result and mark ANALYZED
    await this.db.client.refactoringJob.update({
      where: { id: jobId },
      data: {
        status: RefactoringStatus.ANALYZED,
        afterCode,
        diffPreview,
        styleChanges: styleChanges as never,
        logicValidation: logicValidation as never,
      },
    });

    // 7. Emit completion event
    this.emitProgress(refJob.projectId, jobId, 'ANALYZED', 100);
    this.logger.log(`Refactoring job completed: ${jobId}`);
  }

  private async handleFailure(jobId: string, errorMessage: string): Promise<void> {
    this.logger.error(`Refactoring job final failure: ${jobId} — ${errorMessage}`);
    try {
      const job = await this.db.client.refactoringJob.findUnique({ where: { id: jobId } });
      await this.db.client.refactoringJob.update({
        where: { id: jobId },
        data: { status: RefactoringStatus.FAILED, errorMessage },
      });
      if (job) this.emitProgress(job.projectId, jobId, 'FAILED', 0);
    } catch (err) {
      this.logger.error(`Failed to update job ${jobId} to FAILED state`, err);
    }
  }

  private async updateStatus(jobId: string, status: RefactoringStatus): Promise<void> {
    await this.db.client.refactoringJob.update({ where: { id: jobId }, data: { status } });
  }

  private emitProgress(projectId: string, jobId: string, status: string, progress: number): void {
    this.gateway.emitSyncStatus({
      projectId,
      status: `refactoring:${status}`,
      message: `Job ${jobId}: ${status} (${progress}%)`,
    });
  }
}
