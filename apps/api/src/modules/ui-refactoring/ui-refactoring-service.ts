/**
 * UIRefactoringService — orchestrates the refactoring lifecycle:
 * credit check → job creation → Bull queue enqueue.
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
import { CreditMeteringService } from '../billing/credit-metering.service';
import { ComponentScannerService } from './component-scanner-service';
import {
  REFACTORING_DEFAULTS,
  REFACTORING_QUEUE_NAME,
  REFACTORING_JOB_OPTIONS,
} from '@nexusui/shared';
import type {
  ComponentAuditListResponse,
  ComponentAuditDto,
  RefactoringJobDto,
  RefactoringJobListResponse,
  RefactoringJobQueryInput,
} from '@nexusui/shared';

export interface RefactoringJobData {
  jobId: string;
  userId: string;
}

@Injectable()
export class UIRefactoringService {
  private readonly logger = new Logger(UIRefactoringService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly scanner: ComponentScannerService,
    private readonly creditMetering: CreditMeteringService,
    @InjectQueue(REFACTORING_QUEUE_NAME) private readonly refactoringQueue: Queue<RefactoringJobData>,
  ) {}

  /** Delegate component scan to scanner service */
  async scanComponents(
    projectId: string,
    userId: string,
    branch?: string,
    paths?: string[],
  ): Promise<ComponentAuditListResponse> {
    return this.scanner.scanRepository(projectId, userId, branch, paths);
  }

  /** Trigger beautification for a single component */
  async beautifyComponent(
    projectId: string,
    userId: string,
    componentPath: string,
    aiModelId: string,
    designSystemId?: string,
  ): Promise<RefactoringJobDto> {
    // Verify project ownership
    const project = await this.db.client.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new ForbiddenException('Project not found or access denied');

    // Verify AI model exists and is active
    const model = await this.db.client.aIModel.findFirst({ where: { id: aiModelId, isActive: true } });
    if (!model) throw new NotFoundException('AI model not found or inactive');

    const creditsCost = REFACTORING_DEFAULTS.DEFAULT_CREDITS_PER_COMPONENT;

    // Check user credit balance
    const user = await this.db.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.creditBalance < creditsCost) {
      throw new BadRequestException(`Insufficient credits: need ${creditsCost}, have ${user.creditBalance}`);
    }

    // Extract component name from path
    const parts = componentPath.split('/');
    const componentName = (parts[parts.length - 1] ?? componentPath).replace(/\.(tsx|jsx)$/, '');

    // Create job and deduct credits atomically
    const job = await this.db.client.$transaction(async (tx) => {
      const created = await tx.refactoringJob.create({
        data: {
          projectId,
          userId,
          componentPath,
          componentName,
          aiModelId,
          creditsUsed: creditsCost,
          status: 'PENDING',
        },
      });
      await this.creditMetering.deductCredits(userId, creditsCost, created.id);
      return created;
    });

    // Enqueue Bull job
    await this.refactoringQueue.add(
      { jobId: job.id, userId },
      { ...REFACTORING_JOB_OPTIONS, jobId: job.id },
    );

    this.logger.log(`Refactoring job queued: ${job.id} (${componentPath})`);
    void designSystemId; // passed to processor via DB lookup if needed
    return this.toJobDto(job);
  }

  /** List refactoring jobs for a project with optional status filter */
  async getJobs(
    projectId: string,
    userId: string,
    query: RefactoringJobQueryInput,
  ): Promise<RefactoringJobListResponse> {
    const project = await this.db.client.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new ForbiddenException('Project not found or access denied');

    const [jobs, total] = await Promise.all([
      this.db.client.refactoringJob.findMany({
        where: { projectId, ...(query.status && { status: query.status }) },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      }),
      this.db.client.refactoringJob.count({
        where: { projectId, ...(query.status && { status: query.status }) },
      }),
    ]);

    return { jobs: jobs.map((j) => this.toJobDto(j)), total };
  }

  /** Get a single refactoring job by ID */
  async getJob(jobId: string, userId: string): Promise<RefactoringJobDto> {
    const job = await this.db.client.refactoringJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Refactoring job not found');
    if (job.userId !== userId) throw new ForbiddenException('Access denied');
    return this.toJobDto(job);
  }

  /** Get component audits for a project */
  async getComponentAudits(projectId: string, userId: string): Promise<ComponentAuditListResponse> {
    const project = await this.db.client.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new ForbiddenException('Project not found or access denied');
    return this.scanner.getComponentAudits(projectId);
  }

  /** Get a single component audit (with ownership check) */
  async getComponentAudit(id: string, userId: string): Promise<ComponentAuditDto> {
    const audit = await this.db.client.componentAudit.findUnique({
      where: { id },
      include: { project: { select: { userId: true } } },
    });
    if (!audit) throw new NotFoundException('Component audit not found');
    if (audit.project.userId !== userId) throw new ForbiddenException('Access denied');
    return this.scanner.toAuditDto(audit);
  }

  private toJobDto(job: Awaited<ReturnType<typeof this.db.client.refactoringJob.findUniqueOrThrow>>): RefactoringJobDto {
    // Build base DTO — omit optional fields when null to satisfy exactOptionalPropertyTypes
    const dto: RefactoringJobDto = {
      id: job.id,
      projectId: job.projectId,
      componentPath: job.componentPath,
      componentName: job.componentName,
      status: job.status as RefactoringJobDto['status'],
      creditsUsed: job.creditsUsed,
      createdAt: job.createdAt.toISOString(),
    };
    if (job.beforeCode != null) dto.beforeCode = job.beforeCode;
    if (job.afterCode != null) dto.afterCode = job.afterCode;
    if (job.diffPreview != null) dto.diffPreview = job.diffPreview;
    if (job.styleChanges != null) dto.styleChanges = job.styleChanges as never;
    if (job.logicValidation != null) dto.logicValidation = job.logicValidation as never;
    if (job.githubPrUrl != null) dto.githubPrUrl = job.githubPrUrl;
    if (job.githubBranch != null) dto.githubBranch = job.githubBranch;
    if (job.errorMessage != null) dto.errorMessage = job.errorMessage;
    return dto;
  }
}
