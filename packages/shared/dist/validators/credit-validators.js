import { z } from 'zod';
import { OperationType } from '../types/credit-types';
import { CREDIT_LIMITS } from '../constants/credit-constants';
export const OperationTypeSchema = z.nativeEnum(OperationType);
/** Schema for purchasing a credit package */
export const PurchaseCreditsSchema = z.object({
    packageId: z.string().uuid(),
    /** Stripe Payment Method ID from the frontend */
    paymentMethodId: z.string().min(1),
});
/** Schema for admin manual credit adjustments */
export const AdminCreditAdjustmentSchema = z.object({
    userId: z.string().uuid(),
    amount: z
        .number()
        .int()
        .min(-CREDIT_LIMITS.MAX_SINGLE_ADJUSTMENT)
        .max(CREDIT_LIMITS.MAX_SINGLE_ADJUSTMENT),
    reason: z.string().min(1).max(500),
});
/** Schema for querying credit ledger history */
export const CreditLedgerQuerySchema = z.object({
    userId: z.string().uuid().optional(),
    operationType: OperationTypeSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
});
/** Schema for creating a credit package (admin) */
export const CreateCreditPackageSchema = z.object({
    name: z.string().min(1).max(100),
    credits: z.number().int().min(CREDIT_LIMITS.MIN_PACKAGE_CREDITS),
    priceUsd: z.number().positive(),
    stripePriceId: z.string().min(1),
});
export const UpdateCreditPackageSchema = CreateCreditPackageSchema.partial().extend({
    isActive: z.boolean().optional(),
});
//# sourceMappingURL=credit-validators.js.map