/**
 * UserWebhookController — handles Clerk webhook events.
 * POST /webhooks/clerk
 *
 * Verifies svix signature before processing.
 * Handles: user.created, user.updated, user.deleted
 */
import {
  BadRequestException,
  Controller,
  Headers,
  Logger,
  Post,
  RawBodyRequest,
  Req,
  Body,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import type { Request } from 'express';
import { DatabaseService } from '../../database/database-service';
import { InitialGrantService } from '../billing/initial-grant.service';
import { UserRole } from '@nexusui/database';

interface ClerkUserData {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: ClerkUserData;
}

@Controller('webhooks')
export class UserWebhookController {
  private readonly logger = new Logger(UserWebhookController.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
    private readonly initialGrantService: InitialGrantService,
  ) {}

  @SkipThrottle()
  @Post('clerk')
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() rawBody: unknown,
  ): Promise<{ received: boolean }> {
    const secret = this.config.get<string>('CLERK_WEBHOOK_SECRET');

    let event: ClerkWebhookEvent;
    const bodyBuffer = req.rawBody;

    if (secret && bodyBuffer) {
      try {
        const wh = new Webhook(secret);
        event = wh.verify(bodyBuffer.toString(), {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        }) as ClerkWebhookEvent;
      } catch (err) {
        this.logger.error('Webhook signature verification failed', err);
        throw new BadRequestException('Invalid webhook signature');
      }
    } else {
      // No secret configured — accept without verification (dev only)
      if (!secret) {
        this.logger.warn('CLERK_WEBHOOK_SECRET not configured — skipping verification');
      }
      event = rawBody as ClerkWebhookEvent;
    }

    await this.processEvent(event);
    return { received: true };
  }

  private async processEvent(event: ClerkWebhookEvent): Promise<void> {
    const { type, data } = event;

    switch (type) {
      case 'user.created':
        await this.handleUserCreated(data);
        break;
      case 'user.updated':
        await this.handleUserUpdated(data);
        break;
      case 'user.deleted':
        await this.handleUserDeleted(data);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${String(type)}`);
    }
  }

  private getPrimaryEmail(data: ClerkUserData): string {
    const primary = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    );
    return primary?.email_address ?? data.email_addresses[0]?.email_address ?? '';
  }

  private getFullName(data: ClerkUserData): string {
    return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unknown';
  }

  private async handleUserCreated(data: ClerkUserData): Promise<void> {
    this.logger.log(`Creating user from Clerk: ${data.id}`);
    const user = await this.db.client.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId: data.id,
        email: this.getPrimaryEmail(data),
        name: this.getFullName(data),
        // Prisma nullable field requires null, not undefined
        avatarUrl: data.image_url,
        role: UserRole.USER,
        creditBalance: 0,
      },
      update: {},
    });
    // Grant initial free credits to new users
    await this.initialGrantService.grantInitialCredits(user.id);
  }

  private async handleUserUpdated(data: ClerkUserData): Promise<void> {
    this.logger.log(`Updating user from Clerk: ${data.id}`);
    await this.db.client.user.updateMany({
      where: { clerkId: data.id },
      data: {
        email: this.getPrimaryEmail(data),
        name: this.getFullName(data),
        avatarUrl: data.image_url,
      },
    });
  }

  private async handleUserDeleted(data: ClerkUserData): Promise<void> {
    this.logger.log(`Deleting user from Clerk: ${data.id}`);
    await this.db.client.user.deleteMany({ where: { clerkId: data.id } });
  }
}
