/**
 * UserService — handles user profile retrieval, updates, and admin operations.
 * All writes go through Prisma via DatabaseService.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import type { UpdateUserInput, AdminCreditAdjustmentInput } from '@nexusui/shared';
import type { User } from '@nexusui/database';
import { CreditOperationType } from '@nexusui/database';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  /** Get a user by their internal DB id (includes credit balance) */
  async getUserById(id: string): Promise<User> {
    const user = await this.db.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Get a user by Clerk ID */
  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return this.db.client.user.findUnique({ where: { clerkId } });
  }

  /** Update current user's mutable profile fields */
  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const existing = await this.db.client.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    // Build update data explicitly to satisfy Prisma exactOptionalPropertyTypes
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data['name'] = input.name;
    if (input.avatarUrl !== undefined) data['avatarUrl'] = input.avatarUrl;

    return this.db.client.user.update({ where: { id }, data });
  }

  /** List all users (admin) with pagination */
  async listUsers(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.db.client.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.client.user.count(),
    ]);
    return { users, total };
  }

  /**
   * Admin: adjust a user's credit balance.
   * Creates a ledger entry for audit trail.
   * Runs in a Prisma interactive transaction for consistency.
   */
  async adjustCredits(input: AdminCreditAdjustmentInput): Promise<User> {
    const user = await this.db.client.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new NotFoundException('User not found');

    const newBalance = Math.max(0, user.creditBalance + input.amount);

    return this.db.client.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: input.userId },
        data: { creditBalance: newBalance },
      });

      await tx.creditLedger.create({
        data: {
          userId: input.userId,
          amount: input.amount,
          balanceAfter: newBalance,
          operationType: CreditOperationType.ADMIN_ADJUSTMENT,
          description: input.reason,
        },
      });

      return updated;
    });
  }
}
