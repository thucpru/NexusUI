/**
 * HealthController — GET /health
 * Returns DB and Redis connection status. No auth required.
 */
import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  database: 'connected' | 'error';
  redis: 'connected' | 'error';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const overallStatus = dbStatus === 'connected' && redisStatus === 'connected' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      uptime: process.uptime(),
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<'connected' | 'error'> {
    try {
      await this.db.client.$queryRaw`SELECT 1`;
      return 'connected';
    } catch {
      return 'error';
    }
  }

  private async checkRedis(): Promise<'connected' | 'error'> {
    let redis: Redis | undefined;
    try {
      const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
      redis = new Redis(redisUrl, { lazyConnect: true, connectTimeout: 3000 });
      await redis.ping();
      return 'connected';
    } catch {
      return 'error';
    } finally {
      redis?.disconnect();
    }
  }
}
