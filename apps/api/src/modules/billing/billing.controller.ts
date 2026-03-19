/**
 * BillingController — user-facing billing endpoints.
 *
 * Routes (all under /api/v1):
 *   POST /billing/checkout     — create Stripe Checkout session
 *   GET  /billing/balance      — current credit balance
 *   GET  /billing/packages     — list active credit packages
 *   GET  /billing/history      — paginated ledger history
 *   GET  /billing/usage        — usage breakdown
 *   POST /webhooks/stripe      — Stripe webhook (no auth — verified by signature)
 */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth-guard';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth-guard';
import { BillingService } from './billing.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { PurchaseCreditsDto } from './dto/purchase-credits-dto';

interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

@Controller()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly webhookService: StripeWebhookService,
  ) {}

  /** POST /billing/checkout — create Stripe Checkout session */
  @Post('billing/checkout')
  @UseGuards(ClerkAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createCheckout(
    @Req() req: AuthRequest,
    @Body() dto: PurchaseCreditsDto,
  ): Promise<{ url: string }> {
    const url = await this.billingService.createCheckoutSession(req.user.id, dto.packageId);
    return { url };
  }

  /** GET /billing/balance — current credit balance */
  @Get('billing/balance')
  @UseGuards(ClerkAuthGuard)
  async getBalance(
    @Req() req: AuthRequest,
  ): Promise<{ balance: number; lastUpdatedAt: Date | null }> {
    return this.billingService.getBalance(req.user.id);
  }

  /** GET /billing/packages — list active packages sorted by sortOrder */
  @Get('billing/packages')
  @UseGuards(ClerkAuthGuard)
  async getPackages(@Req() _req: AuthRequest) {
    return this.billingService.getActivePackages();
  }

  /**
   * GET /billing/history — paginated credit ledger entries.
   * Query params: limit (default 20, max 100), cursor (ISO timestamp)
   */
  @Get('billing/history')
  @UseGuards(ClerkAuthGuard)
  async getHistory(
    @Req() req: AuthRequest,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.billingService.getCreditHistory(req.user.id, parsedLimit, cursor);
  }

  /**
   * GET /billing/usage — usage breakdown by date.
   * Query param: period = 'daily' | 'weekly' (default 'weekly')
   */
  @Get('billing/usage')
  @UseGuards(ClerkAuthGuard)
  async getUsage(
    @Req() req: AuthRequest,
    @Query('period') period?: 'daily' | 'weekly',
  ) {
    return this.billingService.getUsageBreakdown(req.user.id, period ?? 'weekly');
  }

  /**
   * POST /webhooks/stripe — Stripe webhook handler.
   * No auth guard — Stripe signature is verified inside the service.
   * SkipThrottle: webhooks from Stripe must never be rate-limited.
   */
  @SkipThrottle()
  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody ?? Buffer.from('');
    const event = this.webhookService.constructEvent(rawBody, signature);
    await this.webhookService.handleEvent(event);
    return { received: true };
  }
}
