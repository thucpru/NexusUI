/** Format a credit count for display (e.g. 1500 → "1,500 credits") */
export declare function formatCredits(amount: number): string;
/** Format a USD price in cents (e.g. 2000 → "$20.00") */
export declare function formatPriceCents(cents: number): string;
/** Format a USD price in dollars (e.g. 20 → "$20.00") */
export declare function formatPriceUsd(dollars: number): string;
/** Calculate cost label for a generation (e.g. "10 credits ($0.02)") */
export declare function formatGenerationCost(creditCost: number, creditPriceUsd: number): string;
/** Return true if a balance is below the low-balance warning threshold */
export declare function isBelowLowBalanceThreshold(balance: number): boolean;
/** Return a label for a credit balance state */
export declare function getCreditBalanceLabel(balance: number): 'empty' | 'low' | 'ok';
//# sourceMappingURL=credit-formatting.d.ts.map