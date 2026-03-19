/**
 * GitHubWebhookHandlerService — verifies GitHub webhook signatures
 * and processes push events to trigger code→design sync.
 */
import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CodeToDesignSyncService } from './code-to-design-sync.service';
import { DatabaseService } from '../../database/database-service';

/** File extensions that should trigger re-sync */
const SYNC_TRIGGER_EXTENSIONS = ['.tsx', '.jsx', '.css', '.scss'];

@Injectable()
export class GitHubWebhookHandlerService {
  private readonly logger = new Logger(GitHubWebhookHandlerService.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
    private readonly codeToDesignSync: CodeToDesignSyncService,
  ) {
    this.webhookSecret = this.config.get<string>('GITHUB_WEBHOOK_SECRET') ?? '';
    if (!this.webhookSecret) {
      this.logger.warn('GITHUB_WEBHOOK_SECRET not set — webhook signature verification disabled');
    }
  }

  /**
   * Verifies signature and dispatches the event to the appropriate handler.
   */
  async handle(
    event: string,
    signature: string,
    rawBody: Buffer,
    payload: Record<string, unknown>,
  ): Promise<void> {
    this.verifySignature(rawBody, signature);

    switch (event) {
      case 'push':
        await this.handlePush(payload);
        break;
      case 'ping':
        this.logger.log('GitHub webhook ping received — connection confirmed');
        break;
      default:
        this.logger.debug(`Unhandled GitHub webhook event: ${event}`);
    }
  }

  private async handlePush(payload: Record<string, unknown>): Promise<void> {
    const repoData = payload['repository'] as Record<string, unknown> | undefined;
    const repoFullName = String(repoData?.['full_name'] ?? '');
    const ref = String(payload['ref'] ?? '');
    const pushedBranch = ref.replace('refs/heads/', '');

    if (!repoFullName) {
      throw new BadRequestException('Missing repository.full_name in webhook payload');
    }

    // Check if any modified files are relevant
    const commits = (payload['commits'] as Record<string, unknown>[]) ?? [];
    const changedFiles = commits.flatMap((c) => [
      ...((c['added'] as string[]) ?? []),
      ...((c['modified'] as string[]) ?? []),
      ...((c['removed'] as string[]) ?? []),
    ]);

    const hasRelevantFiles = changedFiles.some((f) =>
      SYNC_TRIGGER_EXTENSIONS.some((ext) => f.endsWith(ext)),
    );

    if (!hasRelevantFiles) {
      this.logger.debug(`Push to ${repoFullName}@${pushedBranch} — no relevant files changed`);
      return;
    }

    // Find the connected project
    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) return;

    const connection = await this.db.client.gitHubConnection.findFirst({
      where: { repoOwner: owner, repoName: repo, branch: pushedBranch },
    });

    if (!connection) {
      this.logger.debug(`No NexusUI connection found for ${repoFullName}@${pushedBranch}`);
      return;
    }

    this.logger.log(
      `Push event on ${repoFullName}@${pushedBranch} — triggering code→design sync for project ${connection.projectId}`,
    );

    // Trigger sync (fire-and-forget; errors are logged, not propagated)
    this.codeToDesignSync.sync(connection.projectId).catch((err) => {
      this.logger.error(`Webhook-triggered sync failed for ${connection.projectId}`, err);
    });
  }

  /**
   * Verifies GitHub's HMAC-SHA256 webhook signature.
   * Header format: sha256=<hex_digest>
   */
  private verifySignature(rawBody: Buffer, signature: string): void {
    if (!this.webhookSecret) return; // Skip if secret not configured

    if (!signature?.startsWith('sha256=')) {
      throw new UnauthorizedException('Missing or malformed GitHub webhook signature');
    }

    const expected = `sha256=${crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex')}`;

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('GitHub webhook signature mismatch');
    }
  }
}
