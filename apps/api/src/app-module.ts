/**
 * AppModule — root NestJS module.
 * Wires together all feature modules, guards, and infrastructure.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { appConfig } from './config/app-config';
import { DatabaseModule } from './database/database-module';
import { UserModule } from './modules/user/user-module';
import { ProjectModule } from './modules/project/project-module';
import { HealthModule } from './modules/health/health-module';
import { BillingModule } from './modules/billing/billing.module';
import { ModelRegistryModule } from './modules/model-registry/model-registry-module';
import { AiGenerationModule } from './modules/ai-generation/ai-generation-module';
import { GatewayModule } from './gateway/gateway.module';
import { GitHubSyncModule } from './modules/github-sync/github-sync.module';

@Module({
  imports: [
    // Config — validate env at startup
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: appConfig,
    }),

    // Rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // ms
        limit: 100,
      },
    ]),

    // Bull (Redis-backed job queues) — used by AI generation service (Phase 6)
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      }),
    }),

    // Global DB module (provides DatabaseService to all modules)
    DatabaseModule,

    // Feature modules
    UserModule,
    ProjectModule,
    HealthModule,
    BillingModule,
    ModelRegistryModule,
    AiGenerationModule,

    // Socket.IO gateway (global — available to all modules)
    GatewayModule,

    // GitHub App sync (Phase 7)
    GitHubSyncModule,
  ],
  providers: [
    // Bind ThrottlerGuard globally — applies rate limiting to all routes
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [],
})
export class AppModule {}
