/**
 * UIRefactoringController — REST API for UI refactoring operations.
 * All routes require ClerkAuthGuard authentication.
 *
 * Routes:
 *   POST /:projectId/scan           — trigger component scan
 *   GET  /:projectId/components     — list component audits
 *   GET  /:projectId/components/:id — component audit detail
 *   POST /:projectId/beautify       — start beautification job
 *   GET  /:projectId/jobs           — list refactoring jobs
 *   GET  /:projectId/jobs/:jobId    — job detail
 *   POST /:projectId/generate-pr   — create GitHub PR
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user-decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation-pipe';
import { UIRefactoringService } from './ui-refactoring-service';
import { RefactoringPrService } from './refactoring-pr-service';
import {
  scanComponentsSchema,
  beautifyComponentSchema,
  generatePrSchema,
  refactoringJobQuerySchema,
} from './dto/refactoring-request-dto';
import type {
  ScanComponentsDto,
  BeautifyComponentDto,
  GeneratePrDto,
  RefactoringJobQueryDto,
} from './dto/refactoring-request-dto';
import type { ApiResponse } from '@nexusui/shared';
import type {
  ComponentAuditListResponse,
  ComponentAuditDto,
  RefactoringJobDto,
  RefactoringJobListResponse,
} from '@nexusui/shared';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth-guard';
import type { PrResult } from './refactoring-pr-service';

@UseGuards(ClerkAuthGuard)
@Controller('refactoring')
export class UIRefactoringController {
  constructor(
    private readonly refactoringService: UIRefactoringService,
    private readonly prService: RefactoringPrService,
  ) {}

  /** Trigger a component scan for a project's GitHub repository */
  @Post(':projectId/scan')
  @HttpCode(HttpStatus.ACCEPTED)
  async scanComponents(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(scanComponentsSchema)) body: ScanComponentsDto,
  ): Promise<ApiResponse<ComponentAuditListResponse>> {
    const result = await this.refactoringService.scanComponents(
      projectId,
      user.id,
      body.branch,
      body.paths,
    );
    return { success: true, data: result, message: 'Scan completed' };
  }

  /** List all component audits for a project */
  @Get(':projectId/components')
  async listComponents(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ComponentAuditListResponse>> {
    const result = await this.refactoringService.getComponentAudits(projectId, user.id);
    return { success: true, data: result };
  }

  /** Get a single component audit by ID */
  @Get(':projectId/components/:componentId')
  async getComponent(
    @Param('componentId') componentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<ComponentAuditDto>> {
    const result = await this.refactoringService.getComponentAudit(componentId, user.id);
    return { success: true, data: result };
  }

  /** Start a beautification job for a component */
  @Post(':projectId/beautify')
  @HttpCode(HttpStatus.ACCEPTED)
  async beautifyComponent(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(beautifyComponentSchema)) body: BeautifyComponentDto,
  ): Promise<ApiResponse<RefactoringJobDto>> {
    const job = await this.refactoringService.beautifyComponent(
      projectId,
      user.id,
      body.componentPath,
      body.aiModelId,
      body.designSystemId,
    );
    return { success: true, data: job, message: 'Beautification job queued' };
  }

  /** List refactoring jobs for a project */
  @Get(':projectId/jobs')
  async listJobs(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(refactoringJobQuerySchema)) query: RefactoringJobQueryDto,
  ): Promise<ApiResponse<RefactoringJobListResponse>> {
    const result = await this.refactoringService.getJobs(projectId, user.id, query);
    return { success: true, data: result };
  }

  /** Get a single refactoring job by ID */
  @Get(':projectId/jobs/:jobId')
  async getJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiResponse<RefactoringJobDto>> {
    const job = await this.refactoringService.getJob(jobId, user.id);
    return { success: true, data: job };
  }

  /** Create a GitHub PR from analyzed refactoring jobs */
  @Post(':projectId/generate-pr')
  @HttpCode(HttpStatus.CREATED)
  async generatePr(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(generatePrSchema)) body: GeneratePrDto,
  ): Promise<ApiResponse<PrResult>> {
    const result = await this.prService.generatePullRequest(
      projectId,
      user.id,
      body.jobIds,
      body.branchName,
    );
    return { success: true, data: result, message: 'Pull request created' };
  }
}
