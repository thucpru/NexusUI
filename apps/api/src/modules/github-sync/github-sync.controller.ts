/**
 * GitHubSyncController — HTTP endpoints for GitHub App integration.
 *
 * Routes (all under global prefix /api/v1):
 *   POST   /github/connect
 *   GET    /github/repos
 *   GET    /github/branches/:projectId
 *   POST   /github/sync/design-to-code
 *   POST   /github/sync/code-to-design
 *   GET    /github/sync/status/:projectId
 *   POST   /webhooks/github
 */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth-guard';
import { GitHubSyncService } from './github-sync.service';
import { GitHubWebhookHandlerService } from './github-webhook-handler.service';
import { ConnectRepoDto } from './dto/connect-repo-dto';
import {
  DesignToCodeSyncRequestDto,
  CodeToDesignSyncRequestDto,
} from './dto/sync-request-dto';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller()
export class GitHubSyncController {
  constructor(
    private readonly syncService: GitHubSyncService,
    private readonly webhookHandler: GitHubWebhookHandlerService,
  ) {}

  /**
   * POST /github/connect
   * Stores GitHub App installation ID + repo details for a project.
   */
  @Post('github/connect')
  @UseGuards(ClerkAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async connectRepo(@Body() dto: ConnectRepoDto, @Req() req: AuthenticatedRequest) {
    await this.syncService.connectRepo(dto, req.user.id);
    return { message: 'GitHub repository connected successfully' };
  }

  /**
   * GET /github/repos?installationId=xxx
   * Lists repos accessible via the given installation.
   */
  @Get('github/repos')
  @UseGuards(ClerkAuthGuard)
  async listRepos(@Query('installationId') installationId: string) {
    const repos = await this.syncService.listRepos(Number(installationId));
    return { repos };
  }

  /**
   * GET /github/branches/:projectId
   * Lists branches for the repo connected to a project.
   */
  @Get('github/branches/:projectId')
  @UseGuards(ClerkAuthGuard)
  async listBranches(@Param('projectId') projectId: string, @Req() req: AuthenticatedRequest) {
    const branches = await this.syncService.listBranches(projectId, req.user.id);
    return { branches };
  }

  /**
   * POST /github/sync/design-to-code
   * Generates code from design tokens and pushes to GitHub (PR or direct commit).
   */
  @Post('github/sync/design-to-code')
  @UseGuards(ClerkAuthGuard)
  async syncDesignToCode(@Body() dto: DesignToCodeSyncRequestDto, @Req() req: AuthenticatedRequest) {
    const result = await this.syncService.syncDesignToCode(
      dto.projectId,
      dto.syncMode,
      dto.targetBranch,
      req.user.id,
    );
    return result;
  }

  /**
   * POST /github/sync/code-to-design
   * Parses repo → returns component tree + design tokens.
   */
  @Post('github/sync/code-to-design')
  @UseGuards(ClerkAuthGuard)
  async syncCodeToDesign(@Body() dto: CodeToDesignSyncRequestDto, @Req() req: AuthenticatedRequest) {
    const result = await this.syncService.syncCodeToDesign(dto.projectId, req.user.id);
    return result;
  }

  /**
   * GET /github/sync/status/:projectId
   * Returns current sync status + last sync timestamp.
   */
  @Get('github/sync/status/:projectId')
  @UseGuards(ClerkAuthGuard)
  async getSyncStatus(@Param('projectId') projectId: string, @Req() req: AuthenticatedRequest) {
    return this.syncService.getSyncStatus(projectId, req.user.id);
  }

  /**
   * POST /webhooks/github
   * Receives GitHub App webhook events. No auth guard — signature-verified instead.
   * SkipThrottle: webhooks from GitHub must never be rate-limited.
   */
  @SkipThrottle()
  @Post('webhooks/github')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: Request,
  ) {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from('');
    const payload = req.body as Record<string, unknown>;

    await this.webhookHandler.handle(event, signature, rawBody, payload);
    return { received: true };
  }
}
