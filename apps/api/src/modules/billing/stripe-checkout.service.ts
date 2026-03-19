/**
 * StripeCheckoutService — creates Stripe Checkout sessions for credit package purchases.
 * Mode: 'payment' (one-time, NOT subscription).
 */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { CreditPackageService } from './credit-package.service';

@Injectable()
export class StripeCheckoutService {
  private readonly logger = new Logger(StripeCheckoutService.name);
  private readonly stripe: Stripe;

  constructor(private readonly packageService: CreditPackageService) {
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    this.stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  }

  /**
   * Create a Stripe Checkout session for purchasing a credit package.
   * Returns the session URL to redirect the user to.
   */
  async createCheckoutSession(userId: string, packageId: string): Promise<string> {
    const pkg = await this.packageService.findById(packageId);

    if (!pkg.isActive) {
      throw new BadRequestException(`Credit package ${packageId} is not available`);
    }

    if (!pkg.stripePriceId) {
      throw new BadRequestException(`Credit package ${packageId} has no Stripe Price configured`);
    }

    const successUrl = `${this.getAppBaseUrl()}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${this.getAppBaseUrl()}/billing/cancelled`;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: pkg.stripePriceId, quantity: 1 }],
      metadata: {
        userId,
        packageId,
        creditAmount: String(pkg.creditAmount),
        bonusCredits: String(pkg.bonusCredits),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });

    if (!session.url) {
      throw new BadRequestException('Failed to create Stripe Checkout session');
    }

    this.logger.log(
      `Created Checkout session ${session.id} for user ${userId}, package ${packageId}`,
    );
    return session.url;
  }

  private getAppBaseUrl(): string {
    return process.env['APP_BASE_URL'] ?? 'http://localhost:3000';
  }
}
