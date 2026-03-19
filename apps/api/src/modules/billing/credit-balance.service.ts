/**
 * CreditBalanceService — Redis-cached credit balance reads.
 * Redis is source of speed; CreditLedger.balanceAfter is source of truth.
 */
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { DatabaseService } from '../../database/database-service';
import { RealtimeGateway } from '../../gateway/realtime-gateway';

const BALANCE_TTL_SECONDS = 300; // 5 minutes
const LOW_BALANCE_THRESHOLD = 10;

@Injectable()
export class CreditBalanceService {
  private readonly logger = new Logger(CreditBalanceService.name);
  private readonly redis: Redis;

  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: RealtimeGateway,
  ) {
    const url = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
    this.redis = new Redis(url, { lazyConnect: true, enableOfflineQueue: false });
    this.redis.on('error', (err) => this.logger.warn(`Redis error: ${err.message}`));
  }

  private cacheKey(userId: string): string {
    return `credits:balance:${userId}`;
  }

  /**
   * Get credit balance: Redis cache → fallback to DB (last ledger entry).
   * Returns 0 if no ledger entries exist (new user before initial grant).
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const cached = await this.redis.get(this.cacheKey(userId));
      if (cached !== null) return parseInt(cached, 10);
    } catch {
      // Redis unavailable — fall through to DB
    }

    return this.fetchFromDb(userId);
  }

  /** Check whether user has at least `required` credits */
  async hasEnoughCredits(userId: string, required: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= required;
  }

  /**
   * Write balance to Redis and emit Socket.IO event.
   * Called after every credit operation.
   */
  async setBalance(userId: string, newBalance: number, delta: number): Promise<void> {
    try {
      await this.redis.setex(this.cacheKey(userId), BALANCE_TTL_SECONDS, String(newBalance));
    } catch {
      // Non-fatal — DB is source of truth
    }

    this.gateway.emitCreditsUpdated({ userId, newBalance, delta });

    if (newBalance < LOW_BALANCE_THRESHOLD) {
      this.logger.warn(`User ${userId} low balance: ${newBalance}`);
    }
  }

  /** Invalidate cached balance (forces re-read from DB on next request) */
  async invalidate(userId: string): Promise<void> {
    try {
      await this.redis.del(this.cacheKey(userId));
    } catch {
      // Non-fatal
    }
  }

  private async fetchFromDb(userId: string): Promise<number> {
    // Most recent ledger entry holds the authoritative balance
    const latest = await this.db.client.creditLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { balanceAfter: true },
    });

    const balance = latest?.balanceAfter ?? 0;

    // Warm cache
    try {
      await this.redis.setex(this.cacheKey(userId), BALANCE_TTL_SECONDS, String(balance));
    } catch {
      // Non-fatal
    }

    return balance;
  }
}
