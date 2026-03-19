/** Categories of operations that consume or add credits */
export declare enum OperationType {
    PURCHASE = "PURCHASE",
    AI_GENERATION = "AI_GENERATION",
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT",
    REFUND = "REFUND"
}
/**
 * Append-only credit ledger entry.
 * Positive amount = credit added; negative = credit consumed.
 */
export interface CreditLedger {
    id: string;
    userId: string;
    operationType: OperationType;
    amount: number;
    balanceAfter: number;
    description: string;
    /** Reference ID for the related entity (e.g., generation id, purchase id) */
    referenceId?: string;
    createdAt: Date;
}
/** Admin-defined credit package available for purchase */
export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    priceUsd: number;
    /** Stripe Price ID */
    stripePriceId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
/** Current credit balance summary for a user */
export interface CreditBalance {
    userId: string;
    balance: number;
    lastUpdatedAt: Date;
}
/** Record of a completed credit purchase */
export interface CreditPurchase {
    id: string;
    userId: string;
    packageId: string;
    credits: number;
    amountPaid: number;
    currency: string;
    /** Stripe Payment Intent ID */
    stripePaymentIntentId: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=credit-types.d.ts.map