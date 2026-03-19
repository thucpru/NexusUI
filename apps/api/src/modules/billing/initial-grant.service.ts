/**
 * InitialGrantService — credits awarded to new users on signup.
 * Called from user webhook handler on user.created event.
 * Configurable via INITIAL_CREDIT_GRANT env var (default: 50).
 */
import { Injectable, Logger } from '@nestjs/common';
import { CreditOperationType } from '@nexusui/database';
import { DatabaseService } from '../../database/database-service';
import { CreditBalanceService } from './credit-balance.service';

const DEFAULT_GRANT_AMOUNT = 50;

@Injectable()
export class InitialGrantService {
  private readonly logger = new Logger(InitialGrantService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly balanceService: CreditBalanceService,
  ) {}

  /**
   * Award initial free credits to a newly registered user.
   * Idempotent: skips if user already has a ledger entry.
   */
  async grantInitialCredits(userId: string): Promise<void> {
    const grantAmount = this.resolveGrantAmount();

    // Idempotency: skip if any ledger entry already exists for this user
    const existing = await this.db.client.creditLedger.findFirst({ where: { userId } });
    if (existing) {
      this.logger.debug(`Initial grant skipped for user ${userId} — ledger already exists`);
      return;
    }

    await this.db.client.$transaction(async (tx) => {
      await tx.creditLedger.create({
        data: {
          userId,
          operationType: CreditOperationType.INITIAL_GRANT,
          amount: grantAmount,
          balanceAfter: grantAmount,
          description: `Welcome! ${grantAmount} free credits to get you started.`,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: grantAmount },
      });
    });

    await this.balanceService.setBalance(userId, grantAmount, grantAmount);
    this.logger.log(`Granted ${grantAmount} initial credits to user ${userId}`);
  }

  private resolveGrantAmount(): number {
    const envVal = process.env['INITIAL_CREDIT_GRANT'];
    if (!envVal) return DEFAULT_GRANT_AMOUNT;
    const parsed = parseInt(envVal, 10);
    return isNaN(parsed) || parsed <= 0 ? DEFAULT_GRANT_AMOUNT : parsed;
  }
}
