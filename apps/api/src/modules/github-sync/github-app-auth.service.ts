/**
 * GitHubAppAuthService — manages GitHub App JWT and installation access tokens.
 *
 * GitHub App auth flow:
 *   1. Sign a short-lived JWT with the app private key → app-level auth
 *   2. Exchange JWT for an installation access token → repo-level auth
 *   3. Cache installation tokens until expiry (1 hour)
 */
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from 'octokit';

interface CachedToken {
  token: string;
  expiresAt: Date;
}

@Injectable()
export class GitHubAppAuthService {
  private readonly logger = new Logger(GitHubAppAuthService.name);
  /** installationId → cached token */
  private readonly tokenCache = new Map<number, CachedToken>();

  private readonly appId: number;
  private readonly privateKey: string;

  constructor(private readonly config: ConfigService) {
    const appId = this.config.get<string>('GITHUB_APP_ID');
    const privateKey = this.config.get<string>('GITHUB_APP_PRIVATE_KEY');

    if (!appId || !privateKey) {
      throw new InternalServerErrorException(
        'GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY env vars are required',
      );
    }

    this.appId = parseInt(appId, 10);
    // Support newline-escaped key from env (e.g., \\n → \n)
    this.privateKey = privateKey.replace(/\\n/g, '\n');
  }

  /**
   * Returns a valid installation access token for the given installation.
   * Uses cache when token still has >5 minutes remaining.
   */
  async getInstallationToken(installationId: number): Promise<string> {
    const cached = this.tokenCache.get(installationId);
    if (cached && this.isTokenValid(cached)) {
      return cached.token;
    }

    const token = await this.generateInstallationToken(installationId);
    return token;
  }

  /**
   * Returns an authenticated Octokit instance for the given installation.
   */
  async getInstallationOctokit(installationId: number): Promise<Octokit> {
    const token = await this.getInstallationToken(installationId);
    return new Octokit({ auth: token });
  }

  private async generateInstallationToken(installationId: number): Promise<string> {
    try {
      const auth = createAppAuth({
        appId: this.appId,
        privateKey: this.privateKey,
        installationId,
      });

      const result = await auth({ type: 'installation' });
      const expiresAt = new Date((result as { expiresAt: string }).expiresAt);

      this.tokenCache.set(installationId, { token: result.token, expiresAt });
      this.logger.debug(`Generated installation token for installation ${installationId}`);

      return result.token;
    } catch (err) {
      this.logger.error(`Failed to generate installation token for ${installationId}`, err);
      throw new InternalServerErrorException('Failed to authenticate with GitHub App');
    }
  }

  /** Token is valid if it expires more than 5 minutes from now */
  private isTokenValid(cached: CachedToken): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return cached.expiresAt.getTime() - Date.now() > fiveMinutes;
  }
}
