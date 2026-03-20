/**
 * RefactoringPrService — creates GitHub branches, commits refactored files,
 * and opens a Pull Request from completed RefactoringJob records.
 */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import { GitHubBranchService } from '../github-sync/github-branch.service';
import { GitHubAppAuthService } from '../github-sync/github-app-auth.service';

export interface PrResult {
  prUrl: string;
  branchName: string;
  componentCount: number;
}

@Injectable()
export class RefactoringPrService {
  private readonly logger = new Logger(RefactoringPrService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly branchService: GitHubBranchService,
    private readonly authService: GitHubAppAuthService,
  ) {}

  /**
   * Create a GitHub PR for a set of analyzed refactoring jobs.
   * Steps: verify jobs → create branch → commit files → open PR → update jobs.
   */
  async generatePullRequest(
    projectId: string,
    userId: string,
    jobIds: string[],
    branchName?: string,
  ): Promise<PrResult> {
    // Verify project ownership and GitHub connection
    const project = await this.db.client.project.findFirst({
      where: { id: projectId, userId },
      include: { githubConnection: true },
    });
    if (!project) throw new ForbiddenException('Project not found or access denied');
    if (!project.githubConnection) throw new NotFoundException('No GitHub connection for this project');

    const conn = project.githubConnection;
    const installationId = Number(conn.installationId);

    // Fetch and validate jobs
    const jobs = await this.db.client.refactoringJob.findMany({
      where: { id: { in: jobIds }, projectId },
    });

    if (jobs.length === 0) throw new NotFoundException('No refactoring jobs found');

    const notAnalyzed = jobs.filter((j) => j.status !== 'ANALYZED');
    if (notAnalyzed.length > 0) {
      throw new BadRequestException(
        `Jobs not in ANALYZED status: ${notAnalyzed.map((j) => j.id).join(', ')}`,
      );
    }

    const jobsWithCode = jobs.filter((j) => j.afterCode);
    if (jobsWithCode.length === 0) throw new BadRequestException('No jobs have generated code to commit');

    // Resolve target branch name
    const targetBranch = branchName ?? `refactor/ui-${Date.now()}`;
    const baseBranch = conn.branch;

    // Get HEAD SHA of base branch and create new branch
    const headSha = await this.branchService.getBranchSha(installationId, conn.repoOwner, conn.repoName, baseBranch);
    await this.branchService.createBranch(installationId, conn.repoOwner, conn.repoName, targetBranch, headSha);

    this.logger.log(`Created branch ${targetBranch} from ${baseBranch} (sha: ${headSha})`);

    // Commit each refactored file
    const octokit = await this.authService.getInstallationOctokit(installationId);
    let currentSha = headSha;

    for (const job of jobsWithCode) {
      try {
        currentSha = await this.commitFile(
          octokit,
          conn.repoOwner,
          conn.repoName,
          job.componentPath,
          job.afterCode!,
          `refactor(ui): beautify ${job.componentName} styles`,
          targetBranch,
          currentSha,
        );
      } catch (err) {
        this.logger.error(`Failed to commit ${job.componentPath}: ${(err as Error).message}`);
        throw err;
      }
    }

    // Create PR
    const prBody = this.buildPrBody(jobsWithCode);
    const { data: pr } = await octokit.rest.pulls.create({
      owner: conn.repoOwner,
      repo: conn.repoName,
      title: `refactor(ui): beautify ${jobsWithCode.length} component(s)`,
      head: targetBranch,
      base: baseBranch,
      body: prBody,
    });

    this.logger.log(`Created PR #${pr.number}: ${pr.html_url}`);

    // Update all jobs with PR info
    await this.db.client.refactoringJob.updateMany({
      where: { id: { in: jobIds } },
      data: { githubPrUrl: pr.html_url, githubBranch: targetBranch, status: 'PR_CREATED' },
    });

    return { prUrl: pr.html_url, branchName: targetBranch, componentCount: jobsWithCode.length };
  }

  /** Commit a single file to the repo on the given branch */
  private async commitFile(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    octokit: any,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    _parentSha: string,
  ): Promise<string> {
    // Get current file SHA for update
    let fileSha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
      if (!Array.isArray(data) && data.type === 'file') fileSha = data.sha;
    } catch {
      // File doesn't exist yet — create it
    }

    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      ...(fileSha && { sha: fileSha }),
    });

    return (data.commit as { sha: string }).sha;
  }

  private buildPrBody(jobs: Array<{ componentName: string; componentPath: string }>): string {
    const lines = [
      '## UI Refactoring — Automated Style Beautification',
      '',
      'This PR was generated by NexusUI Refactoring Engine.',
      '',
      '### Components Refactored',
      ...jobs.map((j) => `- \`${j.componentPath}\` (${j.componentName})`),
      '',
      '> All business logic has been preserved. Please review style changes before merging.',
    ];
    return lines.join('\n');
  }
}
