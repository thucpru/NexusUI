/** Format a date value to a human-readable string (e.g. "Mar 19, 2026") */
export declare function formatDate(date: Date | string | number): string;
/** Format a date with time (e.g. "Mar 19, 2026, 14:30") */
export declare function formatDateTime(date: Date | string | number): string;
/** Return ISO-8601 string from any date-like value */
export declare function toISOString(date: Date | string | number): string;
/**
 * Return a relative time label (e.g. "2 hours ago", "in 3 days").
 * Uses Intl.RelativeTimeFormat when available.
 */
export declare function formatRelativeTime(date: Date | string | number): string;
//# sourceMappingURL=date-formatting.d.ts.map