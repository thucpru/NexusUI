/**
 * CreditMeteringService — atomic credit deduction, refund, and admin adjustment.
 *
 * Uses Prisma interactive transactions with raw SQL `SELECT ... FOR UPDATE`
 * to lock the latest ledger row and prevent double-spend on concurrent requests.
 *
 * CreditLedger is APPEND-ONLY — never UPDATE or DELETE rows.
 */
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreditOperationType } from '@nexusui/database';
import { DatabaseService } from '../../database/database-service';
import { CreditBalanceService } from './credit-balance.service';

@Injectable()
export class CreditMeteringService {
  private readonly logger = new Logger(CreditMeteringService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly balanceService: CreditBalanceService,
  ) {}

  /**
   * Atomically deduct credits for an AI generation.
   * Uses SELECT FOR UPDATE on the user row to prevent double-spend.
   * Throws BadRequestException if balance is insufficient.
   */
  async deductCredits(userId: string, amount: number, generationId: string): Promise<number> {
    if (amount <= 0) throw new BadRequestException('Deduction amount must be positive');

    const newBalance = await this.db.client.$transaction(async (tx) => {
      // Lock the user row for the duration of the transaction
      const users = await tx.$queryRaw<Array<{ credit_balance: number }>>`
        SELECT credit_balance FROM users WHERE id = ${userId} FOR UPDATE
      `;

      if (!users.length) throw new NotFoundException(`User ${userId} not found`);
      const currentBalance = users[0]!.credit_balance;

      if (currentBalance < amount) {
        throw new BadRequestException(
          `Insufficient credits: have ${currentBalance}, need ${amount}`,
        );
      }

      const newBal = currentBalance - amount;

      await tx.creditLedger.create({
        data: {
          userId,
          operationType: CreditOperationType.GENERATION_DEDUCT,
          amount: -amount,
          balanceAfter: newBal,
          description: `AI generation deduction`,
          referenceId: generationId,
          referenceType: 'generation',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: newBal },
      });

      return newBal;
    });

    await this.balanceService.setBalance(userId, newBalance, -amount);
    this.logger.debug(`Deducted ${amount} credits from user ${userId}. New balance: ${newBalance}`);
    return newBalance;
  }

  /**
   * Refund credits for a failed or cancelled generation.
   * Append-only: inserts a positive GENERATION_REFUND entry.
   */
  async refundCredits(userId: string, amount: number, generationId: string): Promise<number> {
    if (amount <= 0) throw new BadRequestException('Refund amount must be positive');

    const newBalance = await this.db.client.$transaction(async (tx) => {
      const users = await tx.$queryRaw<Array<{ credit_balance: number }>>`
        SELECT credit_balance FROM users WHERE id = ${userId} FOR UPDATE
      `;

      if (!users.length) throw new NotFoundException(`User ${userId} not found`);
      const currentBalance = users[0]!.credit_balance;
      const newBal = currentBalance + amount;

      await tx.creditLedger.create({
        data: {
          userId,
          operationType: CreditOperationType.GENERATION_REFUND,
          amount,
          balanceAfter: newBal,
          description: `Generation refund`,
          referenceId: generationId,
          referenceType: 'generation',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: newBal },
      });

      return newBal;
    });

    await this.balanceService.setBalance(userId, newBalance, amount);
    this.logger.debug(`Refunded ${amount} credits to user ${userId}. New balance: ${newBalance}`);
    return newBalance;
  }

  /**
   * Admin credit adjustment — can be positive (add) or negative (remove).
   * Logs adminUserId as part of description for audit trail.
   */
  async adjustCredits(
    adminUserId: string,
    targetUserId: string,
    amount: number,
    description: string,
  ): Promise<number> {
    const newBalance = await this.db.client.$transaction(async (tx) => {
      const users = await tx.$queryRaw<Array<{ credit_balance: number }>>`
        SELECT credit_balance FROM users WHERE id = ${targetUserId} FOR UPDATE
      `;

      if (!users.length) throw new NotFoundException(`User ${targetUserId} not found`);
      const currentBalance = users[0]!.credit_balance;
      const newBal = Math.max(0, currentBalance + amount);

      await tx.creditLedger.create({
        data: {
          userId: targetUserId,
          operationType: CreditOperationType.ADMIN_ADJUSTMENT,
          amount,
          balanceAfter: newBal,
          description: `[Admin:${adminUserId}] ${description}`,
          referenceId: adminUserId,
          referenceType: 'admin_user',
        },
      });

      await tx.user.update({
        where: { id: targetUserId },
        data: { creditBalance: newBal },
      });

      return newBal;
    });

    await this.balanceService.setBalance(targetUserId, newBalance, amount);
    this.logger.log(
      `Admin ${adminUserId} adjusted credits for user ${targetUserId} by ${amount}. New balance: ${newBalance}`,
    );
    return newBalance;
  }
}
