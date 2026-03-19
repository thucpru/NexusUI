import { OperationType } from '../types/credit-types';

/** Credit amount boundaries for validation and display */
export const CREDIT_LIMITS = {
  /** Minimum credits in a purchasable package */
  MIN_PACKAGE_CREDITS: 10,
  /** Maximum credits that can be added in one admin adjustment */
  MAX_SINGLE_ADJUSTMENT: 100_000,
  /** Alert threshold: warn when user balance falls below this */
  LOW_BALANCE_THRESHOLD: 10,
} as const;

/** Credit costs for each operation type (default/fallback values) */
export const DEFAULT_CREDIT_COSTS: Record<OperationType, number> = {
  [OperationType.PURCHASE]: 0,
  [OperationType.AI_GENERATION]: 10,
  [OperationType.ADMIN_ADJUSTMENT]: 0,
  [OperationType.REFUND]: 0,
};

/** Pre-defined starter credit packages (seeded into DB on first run) */
export const DEFAULT_CREDIT_PACKAGES = [
  { name: 'Starter', credits: 100, priceUsd: 5.0 },
  { name: 'Pro', credits: 500, priceUsd: 20.0 },
  { name: 'Team', credits: 2000, priceUsd: 70.0 },
] as const;

/** Currency used for all credit pricing */
export const CREDIT_CURRENCY = 'USD';
