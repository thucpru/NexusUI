/**
 * StripeWebhookService — processes Stripe webhook events.
 *
 * Handles:
 *   - checkout.session.completed → add purchased credits to user's wallet
 *
 * Idempotency: checks for existing CreditLedger entry with stripeSessionId
 * before processing. Safe for Stripe retries.
 */
import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreditOperationType } from '@nexusui/database';
import { DatabaseService } from '../../database/database-service';
import { CreditBalanceService } from './credit-balance.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly db: DatabaseService,
    private readonly balanceService: CreditBalanceService,
  ) {
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    this.stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  }

  /**
   * Verify Stripe signature and parse event.
   * Must be called with the raw request body (Buffer).
   */
  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
    if (!webhookSecret) throw new InternalServerErrorException('Stripe webhook secret not set');

    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${(err as Error).message}`);
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
  }

  /** Route the verified event to the appropriate handler */
  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const sessionId = session.id;
    const { userId, packageId, creditAmount, bonusCredits } = session.metadata ?? {};

    if (!userId || !packageId || !creditAmount) {
      this.logger.error(`Checkout session ${sessionId} missing required metadata`);
      return;
    }

    // Idempotency check: bail if already processed
    const existing = await this.db.client.creditLedger.findFirst({
      where: { stripeSessionId: sessionId },
    });

    if (existing) {
      this.logger.log(`Checkout session ${sessionId} already processed — skipping`);
      return;
    }

    const totalCredits = parseInt(creditAmount, 10) + parseInt(bonusCredits ?? '0', 10);

    // Execute DB transaction — no side effects (Redis/Socket) inside
    const newBalance = await this.db.client.$transaction(async (tx) => {
      const users = await tx.$queryRaw<Array<{ credit_balance: number }>>`
        SELECT credit_balance FROM users WHERE id = ${userId} FOR UPDATE
      `;

      if (!users.length) {
        this.logger.error(`User ${userId} not found during webhook processing`);
        return null;
      }

      const currentBalance = users[0]!.credit_balance;
      const balance = currentBalance + totalCredits;

      await tx.creditLedger.create({
        data: {
          userId,
          operationType: CreditOperationType.PURCHASE,
          amount: totalCredits,
          balanceAfter: balance,
          description: `Purchased ${totalCredits} credits (package: ${packageId})`,
          referenceId: packageId,
          referenceType: 'credit_package',
          stripeSessionId: sessionId,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: balance },
      });

      return balance;
    });

    // Emit Redis/Socket events AFTER transaction commits to avoid inconsistency on rollback
    if (newBalance !== null) {
      await this.balanceService.setBalance(userId, newBalance, totalCredits);
    }

    this.logger.log(
      `Processed checkout ${sessionId}: +${totalCredits} credits for user ${userId}`,
    );
  }
}
