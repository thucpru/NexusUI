/**
 * GitHubRepoReaderService — reads file tree and file contents from a repo
 * using an installation token. Filters to source files only.
 */
import { Injectable, Logger } from '@nestjs/common';
import { GitHubAppAuthService } from './github-app-auth.service';

/** Files relevant to design→code sync */
const ALLOWED_EXTENSIONS = ['.tsx', '.jsx', '.css', '.scss', '.json'];
const MAX_FILE_COUNT = 1000;

export interface RepoFile {
  path: string;
  sha: string;
  size: number;
}

export interface RepoFileContent {
  path: string;
  content: string;
}

@Injectable()
export class GitHubRepoReaderService {
  private readonly logger = new Logger(GitHubRepoReaderService.name);

  constructor(private readonly authService: GitHubAppAuthService) {}

  /**
   * Returns filtered file list from the repo's default branch tree.
   * Limits to MAX_FILE_COUNT to avoid API overload.
   */
  async getFileTree(
    installationId: number,
    owner: string,
    repo: string,
    branch: string,
  ): Promise<RepoFile[]> {
    const octokit = await this.authService.getInstallationOctokit(installationId);

    try {
      const { data } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: '1',
      });

      const files = (data.tree ?? [])
        .filter(
          (item: { type?: string; path?: string; sha?: string; size?: number }) =>
            item.type === 'blob' && item.path && this.isAllowedFile(item.path),
        )
        .slice(0, MAX_FILE_COUNT)
        .map((item: { type?: string; path?: string; sha?: string; size?: number }) => ({
          path: item.path!,
          sha: item.sha ?? '',
          size: item.size ?? 0,
        }));

      this.logger.debug(`Found ${files.length} relevant files in ${owner}/${repo}@${branch}`);
      return files;
    } catch (err) {
      this.logger.error(`Failed to read file tree for ${owner}/${repo}`, err);
      throw err;
    }
  }

  /**
   * Reads a single file's content. Returns decoded UTF-8 string.
   */
  async getFileContent(
    installationId: number,
    owner: string,
    repo: string,
    path: string,
  ): Promise<RepoFileContent> {
    const octokit = await this.authService.getInstallationOctokit(installationId);

    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });

    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error(`${path} is not a file`);
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { path, content };
  }

  /**
   * Reads multiple files in parallel (batched to avoid rate limits).
   */
  async getFileContents(
    installationId: number,
    owner: string,
    repo: string,
    paths: string[],
  ): Promise<RepoFileContent[]> {
    const BATCH_SIZE = 10;
    const results: RepoFileContent[] = [];

    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
      const batch = paths.slice(i, i + BATCH_SIZE);
      const contents = await Promise.allSettled(
        batch.map((p) => this.getFileContent(installationId, owner, repo, p)),
      );

      for (const result of contents) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.warn(`Failed to read file: ${result.reason}`);
        }
      }
    }

    return results;
  }

  private isAllowedFile(path: string): boolean {
    return ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
  }
}
