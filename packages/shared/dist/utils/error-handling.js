/** Typed application error with an error code for client-side handling */
export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        // Restore prototype chain (needed when extending built-ins in TS)
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
/** Common error codes used across API and client */
export const ERROR_CODES = {
    // Auth
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    // Resource
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    // Credits
    INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    // AI
    MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
    GENERATION_FAILED: 'GENERATION_FAILED',
    // GitHub
    GITHUB_SYNC_FAILED: 'GITHUB_SYNC_FAILED',
    // Generic
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
/** Safely extract an error message from an unknown thrown value */
export function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'An unexpected error occurred';
}
/** Check whether a value is an AppError instance */
export function isAppError(error) {
    return error instanceof AppError;
}
/** Wrap an unknown error into a standard AppError */
export function toAppError(error, fallbackCode = ERROR_CODES.INTERNAL_ERROR) {
    if (isAppError(error))
        return error;
    return new AppError(getErrorMessage(error), fallbackCode, 500);
}
//# sourceMappingURL=error-handling.js.map