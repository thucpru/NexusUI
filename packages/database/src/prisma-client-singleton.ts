/**
 * Prisma Client singleton — prevents connection pool exhaustion in dev
 * with Next.js/NestJS hot reload.
 *
 * Pattern: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Shared Prisma client instance. Reused across hot-reloads in development. */
const nodeEnv = process.env['NODE_ENV'];

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}
