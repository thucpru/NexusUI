/**
 * GitHubBranchService — branch listing and creation.
 */
import { Injectable, Logger } from '@nestjs/common';
import { GitHubAppAuthService } from './github-app-auth.service';

@Injectable()
export class GitHubBranchService {
  private readonly logger = new Logger(GitHubBranchService.name);

  constructor(private readonly authService: GitHubAppAuthService) {}

  /**
   * Returns all branch names for the given repo.
   */
  async listBranches(
    installationId: number,
    owner: string,
    repo: string,
  ): Promise<string[]> {
    const octokit = await this.authService.getInstallationOctokit(installationId);

    try {
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });

      return data.map((b: { name: string }) => b.name);
    } catch (err) {
      this.logger.error(`Failed to list branches for ${owner}/${repo}`, err);
      throw err;
    }
  }

  /**
   * Creates a new branch from the given SHA.
   */
  async createBranch(
    installationId: number,
    owner: string,
    repo: string,
    branchName: string,
    fromSha: string,
  ): Promise<void> {
    const octokit = await this.authService.getInstallationOctokit(installationId);

    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: fromSha,
    });

    this.logger.debug(`Created branch ${branchName} from ${fromSha} in ${owner}/${repo}`);
  }

  /**
   * Resolves the HEAD SHA for a given branch.
   */
  async getBranchSha(
    installationId: number,
    owner: string,
    repo: string,
    branch: string,
  ): Promise<string> {
    const octokit = await this.authService.getInstallationOctokit(installationId);

    const { data } = await octokit.rest.repos.getBranch({ owner, repo, branch });
    return data.commit.sha;
  }
}
