import type { AIModelProvider } from './ai-model-types';

/** High-level platform statistics for the admin dashboard */
export interface AdminStats {
  totalUsers: number;
  activeUsers30d: number;
  totalProjects: number;
  totalGenerations: number;
  totalCreditsIssued: number;
  totalCreditsConsumed: number;
  totalRevenue: number;
  updatedAt: Date;
}

/** Per-model usage statistics for the admin model registry view */
export interface ModelUsageStats {
  modelId: string;
  modelName: string;
  provider: AIModelProvider;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCreditsConsumed: number;
  avgLatencyMs: number;
  lastUsedAt?: Date;
}

/** Revenue breakdown for a time period */
export interface RevenueStats {
  periodStart: Date;
  periodEnd: Date;
  totalRevenue: number;
  currency: string;
  totalPurchases: number;
  avgPurchaseValue: number;
  totalRefunds: number;
  netRevenue: number;
}
