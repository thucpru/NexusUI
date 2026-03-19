/**
 * GitHubSyncService — orchestrator for GitHub sync operations.
 * Handles connect, repo listing, branch listing, and sync status.
 */
import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import { GitHubAppAuthService } from './github-app-auth.service';
import { GitHubBranchService } from './github-branch.service';
import { DesignToCodeSyncService } from './design-to-code-sync.service';
import { CodeToDesignSyncService } from './code-to-design-sync.service';
import type { ConnectRepoDto } from './dto/connect-repo-dto';
import type {
  DesignToCodeResult,
  CodeToDesignResult,
  SyncStatusDto,
} from './dto/sync-status-dto';
import type { SyncMode } from './dto/sync-request-dto';

@Injectable()
export class GitHubSyncService {
  private readonly logger = new Logger(GitHubSyncService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly authService: GitHubAppAuthService,
    private readonly branchService: GitHubBranchService,
    private readonly designToCode: DesignToCodeSyncService,
    private readonly codeToDesign: CodeToDesignSyncService,
  ) {}

  /** Store GitHub App installation for a project */
  async connectRepo(dto: ConnectRepoDto, userId: string): Promise<void> {
    const project = await this.db.client.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException(`Project ${dto.projectId} not found`);
    if (project.userId !== userId) throw new ForbiddenException(`Access denied to project ${dto.projectId}`);

    const existing = await this.db.client.gitHubConnection.findUnique({
      where: { projectId: dto.projectId },
    });

    if (existing) {
      // Update existing connection
      await this.db.client.gitHubConnection.update({
        where: { projectId: dto.projectId },
        data: {
          installationId: BigInt(dto.installationId),
          repoOwner: dto.repoOwner,
          repoName: dto.repoName,
          branch: dto.branch,
          syncStatus: 'IDLE',
        },
      });
      this.logger.log(`Updated GitHub connection for project ${dto.projectId}`);
    } else {
      await this.db.client.gitHubConnection.create({
        data: {
          projectId: dto.projectId,
          installationId: BigInt(dto.installationId),
          repoOwner: dto.repoOwner,
          repoName: dto.repoName,
          branch: dto.branch,
        },
      });
      this.logger.log(`Created GitHub connection for project ${dto.projectId}`);
    }
  }

  /** List all repos accessible via this installation */
  async listRepos(installationId: number): Promise<string[]> {
    const octokit = await this.authService.getInstallationOctokit(installationId);

    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: 100,
    });

    return data.repositories.map(
      (r: { full_name: string }) => r.full_name,
    );
  }

  /** List branches for the connected repo of a project */
  async listBranches(projectId: string, userId: string): Promise<string[]> {
    const connection = await this.getConnectionOrThrow(projectId, userId);

    return this.branchService.listBranches(
      Number(connection.installationId),
      connection.repoOwner,
      connection.repoName,
    );
  }

  /** Trigger design→code sync */
  async syncDesignToCode(
    projectId: string,
    syncMode: SyncMode,
    targetBranch: string,
    userId: string,
  ): Promise<DesignToCodeResult> {
    const connection = await this.getConnectionOrThrow(projectId, userId);

    if (connection.syncStatus === 'SYNCING') {
      throw new ConflictException(`Sync already in progress for project ${projectId}`);
    }

    return this.designToCode.sync(projectId, syncMode, targetBranch);
  }

  /** Trigger code→design sync */
  async syncCodeToDesign(projectId: string, userId: string): Promise<CodeToDesignResult> {
    const connection = await this.getConnectionOrThrow(projectId, userId);

    if (connection.syncStatus === 'SYNCING') {
      throw new ConflictException(`Sync already in progress for project ${projectId}`);
    }

    return this.codeToDesign.sync(projectId);
  }

  /** Get current sync status for a project */
  async getSyncStatus(projectId: string, userId: string): Promise<SyncStatusDto> {
    const connection = await this.getConnectionOrThrow(projectId, userId);

    return {
      projectId: connection.projectId,
      syncStatus: connection.syncStatus,
      lastSyncAt: connection.lastSyncAt,
      repoOwner: connection.repoOwner,
      repoName: connection.repoName,
      branch: connection.branch,
    };
  }

  private async getConnectionOrThrow(projectId: string, userId?: string) {
    // Verify project ownership when userId is provided
    if (userId) {
      const project = await this.db.client.project.findUnique({ where: { id: projectId } });
      if (!project) throw new NotFoundException(`Project ${projectId} not found`);
      if (project.userId !== userId) throw new ForbiddenException(`Access denied to project ${projectId}`);
    }

    const connection = await this.db.client.gitHubConnection.findUnique({
      where: { projectId },
    });
    if (!connection) {
      throw new NotFoundException(`No GitHub connection for project ${projectId}`);
    }
    return connection;
  }
}
