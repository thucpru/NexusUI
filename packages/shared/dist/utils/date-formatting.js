/** Default locale used for date formatting */
const DEFAULT_LOCALE = 'en-US';
/** Format a date value to a human-readable string (e.g. "Mar 19, 2026") */
export function formatDate(date) {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}
/** Format a date with time (e.g. "Mar 19, 2026, 14:30") */
export function formatDateTime(date) {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}
/** Return ISO-8601 string from any date-like value */
export function toISOString(date) {
    return new Date(date).toISOString();
}
/**
 * Return a relative time label (e.g. "2 hours ago", "in 3 days").
 * Uses Intl.RelativeTimeFormat when available.
 */
export function formatRelativeTime(date) {
    const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });
    const diffSeconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
    const absSeconds = Math.abs(diffSeconds);
    if (absSeconds < 60)
        return rtf.format(diffSeconds, 'second');
    if (absSeconds < 3600)
        return rtf.format(Math.round(diffSeconds / 60), 'minute');
    if (absSeconds < 86400)
        return rtf.format(Math.round(diffSeconds / 3600), 'hour');
    if (absSeconds < 604800)
        return rtf.format(Math.round(diffSeconds / 86400), 'day');
    if (absSeconds < 2592000)
        return rtf.format(Math.round(diffSeconds / 604800), 'week');
    if (absSeconds < 31536000)
        return rtf.format(Math.round(diffSeconds / 2592000), 'month');
    return rtf.format(Math.round(diffSeconds / 31536000), 'year');
}
//# sourceMappingURL=date-formatting.js.map