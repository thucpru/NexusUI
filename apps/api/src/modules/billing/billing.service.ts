/**
 * BillingService — orchestrator for the billing module.
 * Delegates to specialized services; provides convenience methods for controllers.
 */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import { CreditBalanceService } from './credit-balance.service';
import { CreditPackageService } from './credit-package.service';
import { StripeCheckoutService } from './stripe-checkout.service';
import type { CreditLedger, CreditPackage } from '@nexusui/database';

export interface CreditHistoryPage {
  entries: CreditLedger[];
  nextCursor: string | null;
}

export interface UsageBreakdown {
  totalDeducted: number;
  totalRefunded: number;
  byDate: Array<{ date: string; amount: number }>;
}

@Injectable()
export class BillingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly balanceService: CreditBalanceService,
    private readonly packageService: CreditPackageService,
    private readonly checkoutService: StripeCheckoutService,
  ) {}

  /** Create Stripe Checkout session and return redirect URL */
  async createCheckoutSession(userId: string, packageId: string): Promise<string> {
    return this.checkoutService.createCheckoutSession(userId, packageId);
  }

  /** Get current credit balance for a user */
  async getBalance(userId: string): Promise<{ balance: number; lastUpdatedAt: Date | null }> {
    const balance = await this.balanceService.getBalance(userId);

    const latest = await this.db.client.creditLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return { balance, lastUpdatedAt: latest?.createdAt ?? null };
  }

  /** List active credit packages (user-facing) */
  async getActivePackages(): Promise<CreditPackage[]> {
    return this.packageService.listActive();
  }

  /**
   * Cursor-based paginated credit ledger history for a user.
   * Cursor is the createdAt ISO string of the last seen entry.
   */
  async getCreditHistory(
    userId: string,
    limit = 20,
    cursor?: string,
  ): Promise<CreditHistoryPage> {
    const take = Math.min(limit, 100);

    const entries = await this.db.client.creditLedger.findMany({
      where: {
        userId,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // Fetch one extra to determine if more pages exist
    });

    const hasMore = entries.length > take;
    const page = hasMore ? entries.slice(0, take) : entries;
    const nextCursor = hasMore ? page[page.length - 1]!.createdAt.toISOString() : null;

    return { entries: page, nextCursor };
  }

  /**
   * Usage breakdown: deductions and refunds by day.
   * Period: 'weekly' = last 7 days, 'daily' = last 24 hours.
   */
  async getUsageBreakdown(userId: string, period: 'daily' | 'weekly' = 'weekly'): Promise<UsageBreakdown> {
    const since = new Date();
    since.setDate(since.getDate() - (period === 'weekly' ? 7 : 1));

    const entries = await this.db.client.creditLedger.findMany({
      where: {
        userId,
        createdAt: { gte: since },
        operationType: { in: ['GENERATION_DEDUCT', 'GENERATION_REFUND'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    let totalDeducted = 0;
    let totalRefunded = 0;

    // Group by date (YYYY-MM-DD)
    const byDateMap = new Map<string, number>();

    for (const entry of entries) {
      const dateKey = entry.createdAt.toISOString().split('T')[0]!;

      if (entry.operationType === 'GENERATION_DEDUCT') {
        totalDeducted += Math.abs(entry.amount);
        byDateMap.set(dateKey, (byDateMap.get(dateKey) ?? 0) + Math.abs(entry.amount));
      } else {
        totalRefunded += entry.amount;
      }
    }

    const byDate = Array.from(byDateMap.entries()).map(([date, amount]) => ({ date, amount }));

    return { totalDeducted, totalRefunded, byDate };
  }

  /** Revenue analytics for admin */
  async getRevenueAnalytics(): Promise<{
    totalPurchases: number;
    totalCreditsIssued: number;
    recentPurchases: CreditLedger[];
  }> {
    const [purchaseAgg, recentPurchases] = await Promise.all([
      this.db.client.creditLedger.aggregate({
        where: { operationType: 'PURCHASE' },
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.db.client.creditLedger.findMany({
        where: { operationType: 'PURCHASE' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      totalPurchases: purchaseAgg._count.id,
      totalCreditsIssued: purchaseAgg._sum.amount ?? 0,
      recentPurchases,
    };
  }
}
