/**
 * BillingModule — credit wallet and Stripe billing feature module.
 *
 * Provides:
 *   - Credit package CRUD (admin)
 *   - Stripe Checkout sessions (one-time payments)
 *   - Stripe webhook processing (idempotent)
 *   - Credit balance reads (Redis cached)
 *   - Atomic credit deduction/refund (SELECT FOR UPDATE)
 *   - Admin credit adjustments
 *   - Initial credit grant for new users
 *
 * Exports: CreditMeteringService, CreditBalanceService, InitialGrantService
 * so other modules (e.g. AI generation) can deduct credits.
 */
import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingAdminController } from './billing-admin.controller';
import { BillingService } from './billing.service';
import { StripeCheckoutService } from './stripe-checkout.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { CreditBalanceService } from './credit-balance.service';
import { CreditMeteringService } from './credit-metering.service';
import { CreditPackageService } from './credit-package.service';
import { InitialGrantService } from './initial-grant.service';

@Module({
  controllers: [BillingController, BillingAdminController],
  providers: [
    BillingService,
    StripeCheckoutService,
    StripeWebhookService,
    CreditBalanceService,
    CreditMeteringService,
    CreditPackageService,
    InitialGrantService,
  ],
  exports: [
    CreditMeteringService,
    CreditBalanceService,
    InitialGrantService,
  ],
})
export class BillingModule {}
