// ─── UI Refactoring Constants ─────────────────────────────────────────────────

/** Numeric limits and timeout values for refactoring operations */
export const REFACTORING_DEFAULTS = {
  /** Max components returned in a single scan */
  MAX_COMPONENTS_PER_SCAN: 500,
  /** Max components that can be beautified in one batch request */
  MAX_BATCH_BEAUTIFY: 20,
  /** Fallback credits charged when no custom pricing is configured */
  DEFAULT_CREDITS_PER_COMPONENT: 5,
  /** Scan job timeout in milliseconds */
  SCAN_TIMEOUT_MS: 120_000,
  /** Beautify job timeout in milliseconds */
  BEAUTIFY_TIMEOUT_MS: 60_000,
} as const;

/** BullMQ queue name for refactoring jobs */
export const REFACTORING_QUEUE_NAME = 'refactoring';

/** Default BullMQ job options applied to all refactoring jobs */
export const REFACTORING_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
};

/** Human-readable labels for each StyleIssueType */
export const STYLE_ISSUE_LABELS: Record<string, string> = {
  INCONSISTENT_SPACING: 'Inconsistent Spacing',
  OUTDATED_CLASSES: 'Outdated CSS Classes',
  MISSING_RESPONSIVE: 'Missing Responsive Design',
  POOR_CONTRAST: 'Poor Color Contrast',
  INLINE_STYLES: 'Inline Styles',
  HARDCODED_COLORS: 'Hardcoded Colors',
  NO_DESIGN_TOKENS: 'No Design Tokens',
};

/** Human-readable labels for each LogicSafety value */
export const LOGIC_SAFETY_LABELS: Record<string, string> = {
  SAFE: 'Safe to Refactor',
  RISKY: 'Review Recommended',
  MANUAL_REVIEW: 'Manual Review Required',
};
