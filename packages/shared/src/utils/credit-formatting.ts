import { CREDIT_CURRENCY, CREDIT_LIMITS } from '../constants/credit-constants';

/** Format a credit count for display (e.g. 1500 → "1,500 credits") */
export function formatCredits(amount: number): string {
  return `${new Intl.NumberFormat('en-US').format(amount)} credits`;
}

/** Format a USD price in cents (e.g. 2000 → "$20.00") */
export function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CREDIT_CURRENCY,
  }).format(cents / 100);
}

/** Format a USD price in dollars (e.g. 20 → "$20.00") */
export function formatPriceUsd(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CREDIT_CURRENCY,
  }).format(dollars);
}

/** Calculate cost label for a generation (e.g. "10 credits ($0.02)") */
export function formatGenerationCost(creditCost: number, creditPriceUsd: number): string {
  const dollarCost = creditCost * creditPriceUsd;
  return `${formatCredits(creditCost)} (${formatPriceUsd(dollarCost)})`;
}

/** Return true if a balance is below the low-balance warning threshold */
export function isBelowLowBalanceThreshold(balance: number): boolean {
  return balance < CREDIT_LIMITS.LOW_BALANCE_THRESHOLD;
}

/** Return a label for a credit balance state */
export function getCreditBalanceLabel(balance: number): 'empty' | 'low' | 'ok' {
  if (balance <= 0) return 'empty';
  if (isBelowLowBalanceThreshold(balance)) return 'low';
  return 'ok';
}
