/** Typed application error with an error code for client-side handling */
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: unknown;
    constructor(message: string, code: string, statusCode?: number, details?: unknown);
}
/** Common error codes used across API and client */
export declare const ERROR_CODES: {
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly MODEL_UNAVAILABLE: "MODEL_UNAVAILABLE";
    readonly GENERATION_FAILED: "GENERATION_FAILED";
    readonly GITHUB_SYNC_FAILED: "GITHUB_SYNC_FAILED";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
/** Safely extract an error message from an unknown thrown value */
export declare function getErrorMessage(error: unknown): string;
/** Check whether a value is an AppError instance */
export declare function isAppError(error: unknown): error is AppError;
/** Wrap an unknown error into a standard AppError */
export declare function toAppError(error: unknown, fallbackCode?: "INTERNAL_ERROR"): AppError;
//# sourceMappingURL=error-handling.d.ts.map