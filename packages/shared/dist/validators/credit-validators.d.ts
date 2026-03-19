import { z } from 'zod';
import { OperationType } from '../types/credit-types';
export declare const OperationTypeSchema: z.ZodNativeEnum<typeof OperationType>;
/** Schema for purchasing a credit package */
export declare const PurchaseCreditsSchema: z.ZodObject<{
    packageId: z.ZodString;
    /** Stripe Payment Method ID from the frontend */
    paymentMethodId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    packageId: string;
    paymentMethodId: string;
}, {
    packageId: string;
    paymentMethodId: string;
}>;
/** Schema for admin manual credit adjustments */
export declare const AdminCreditAdjustmentSchema: z.ZodObject<{
    userId: z.ZodString;
    amount: z.ZodNumber;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    amount: number;
    reason: string;
}, {
    userId: string;
    amount: number;
    reason: string;
}>;
/** Schema for querying credit ledger history */
export declare const CreditLedgerQuerySchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    operationType: z.ZodOptional<z.ZodNativeEnum<typeof OperationType>>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
    userId?: string | undefined;
    operationType?: OperationType | undefined;
}, {
    limit?: number | undefined;
    cursor?: string | undefined;
    userId?: string | undefined;
    operationType?: OperationType | undefined;
}>;
/** Schema for creating a credit package (admin) */
export declare const CreateCreditPackageSchema: z.ZodObject<{
    name: z.ZodString;
    credits: z.ZodNumber;
    priceUsd: z.ZodNumber;
    stripePriceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    credits: number;
    priceUsd: number;
    stripePriceId: string;
}, {
    name: string;
    credits: number;
    priceUsd: number;
    stripePriceId: string;
}>;
export declare const UpdateCreditPackageSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    credits: z.ZodOptional<z.ZodNumber>;
    priceUsd: z.ZodOptional<z.ZodNumber>;
    stripePriceId: z.ZodOptional<z.ZodString>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    credits?: number | undefined;
    priceUsd?: number | undefined;
    stripePriceId?: string | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    credits?: number | undefined;
    priceUsd?: number | undefined;
    stripePriceId?: string | undefined;
    isActive?: boolean | undefined;
}>;
export type PurchaseCreditsInput = z.infer<typeof PurchaseCreditsSchema>;
export type AdminCreditAdjustmentInput = z.infer<typeof AdminCreditAdjustmentSchema>;
export type CreditLedgerQueryInput = z.infer<typeof CreditLedgerQuerySchema>;
export type CreateCreditPackageInput = z.infer<typeof CreateCreditPackageSchema>;
export type UpdateCreditPackageInput = z.infer<typeof UpdateCreditPackageSchema>;
//# sourceMappingURL=credit-validators.d.ts.map