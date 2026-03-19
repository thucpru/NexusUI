/**
 * DatabaseService — wraps Prisma client singleton for NestJS DI.
 * Connects on module init and disconnects on app shutdown.
 */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { prisma } from '@nexusui/database';

// Expose the Prisma client type via its actual runtime shape
type PrismaLike = typeof prisma;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  readonly client: PrismaLike = prisma;

  async onModuleInit(): Promise<void> {
    try {
      await this.client.$connect();
      this.logger.log('Database connected');
    } catch (err) {
      this.logger.error('Database connection failed', err);
      throw err;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
    this.logger.log('Database disconnected');
  }
}
