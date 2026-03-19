/**
 * @nexusui/database — Prisma client and generated types
 *
 * Usage:
 *   import { prisma } from '@nexusui/database';
 *   import type { User, Project } from '@nexusui/database';
 */

// ─── Prisma Client ─────────────────────────────────────────────────────────────
export { prisma } from './prisma-client-singleton.js';

// ─── Prisma Generated Types ────────────────────────────────────────────────────
export type {
  User,
  Project,
  DesignSystem,
  AIModel,
  Generation,
  CreditLedger,
  CreditPackage,
  GitHubConnection,
  Prisma,
} from '@prisma/client';

// ─── Prisma Enums ──────────────────────────────────────────────────────────────
export {
  UserRole,
  ProjectStatus,
  AIModelProvider,
  GenerationStatus,
  CreditOperationType,
  SyncStatus,
} from '@prisma/client';
