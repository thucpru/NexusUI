import { OperationType } from '../types/credit-types';
/** Credit amount boundaries for validation and display */
export declare const CREDIT_LIMITS: {
    /** Minimum credits in a purchasable package */
    readonly MIN_PACKAGE_CREDITS: 10;
    /** Maximum credits that can be added in one admin adjustment */
    readonly MAX_SINGLE_ADJUSTMENT: 100000;
    /** Alert threshold: warn when user balance falls below this */
    readonly LOW_BALANCE_THRESHOLD: 10;
};
/** Credit costs for each operation type (default/fallback values) */
export declare const DEFAULT_CREDIT_COSTS: Record<OperationType, number>;
/** Pre-defined starter credit packages (seeded into DB on first run) */
export declare const DEFAULT_CREDIT_PACKAGES: readonly [{
    readonly name: "Starter";
    readonly credits: 100;
    readonly priceUsd: 5;
}, {
    readonly name: "Pro";
    readonly credits: 500;
    readonly priceUsd: 20;
}, {
    readonly name: "Team";
    readonly credits: 2000;
    readonly priceUsd: 70;
}];
/** Currency used for all credit pricing */
export declare const CREDIT_CURRENCY = "USD";
//# sourceMappingURL=credit-constants.d.ts.map