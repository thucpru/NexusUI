// ─── Types ────────────────────────────────────────────────────────────────────
export type { User, UserRef } from './types/user-types';
export { UserRole } from './types/user-types';

export type { Project, ProjectRef } from './types/project-types';
export { ProjectStatus } from './types/project-types';

export type {
  ColorToken,
  TypographyToken,
  SpacingToken,
  DesignToken,
  DesignSystemTokenSet,
  DesignSystem,
} from './types/design-system-types';

export type {
  Generation,
  GenerationOutput,
  GenerationRequest,
} from './types/generation-types';
export { GenerationStatus } from './types/generation-types';

export type {
  CreditLedger,
  CreditPackage,
  CreditBalance,
  CreditPurchase,
} from './types/credit-types';
export { OperationType } from './types/credit-types';

export type { AIModel, AIModelRef, ModelConfig } from './types/ai-model-types';
export { AIModelProvider, AIModelStatus } from './types/ai-model-types';

export type { GitHubConnection, SyncEvent } from './types/github-types';
export { SyncDirection, SyncStatus } from './types/github-types';

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  AnyApiResponse,
} from './types/api-response-types';

export type { AdminStats, ModelUsageStats, RevenueStats } from './types/admin-types';

// ─── Validators ───────────────────────────────────────────────────────────────
export {
  UserSchema,
  UserRoleSchema,
  UpdateUserSchema,
  UpdateUserRoleSchema,
} from './validators/user-validators';
export type { UpdateUserInput, UpdateUserRoleInput } from './validators/user-validators';

export {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectStatusSchema,
  ProjectIdSchema,
} from './validators/project-validators';
export type {
  CreateProjectInput,
  UpdateProjectInput,
} from './validators/project-validators';

export {
  CreateDesignSystemSchema,
  UpdateDesignSystemSchema,
} from './validators/design-system-validators';
export type {
  CreateDesignSystemInput,
  UpdateDesignSystemInput,
} from './validators/design-system-validators';

export {
  CreateGenerationSchema,
  GenerationQuerySchema,
  GenerationStatusSchema,
} from './validators/generation-validators';
export type {
  CreateGenerationInput,
  GenerationQueryInput,
} from './validators/generation-validators';

export {
  PurchaseCreditsSchema,
  AdminCreditAdjustmentSchema,
  CreditLedgerQuerySchema,
  CreateCreditPackageSchema,
  UpdateCreditPackageSchema,
  OperationTypeSchema,
} from './validators/credit-validators';
export type {
  PurchaseCreditsInput,
  AdminCreditAdjustmentInput,
  CreditLedgerQueryInput,
  CreateCreditPackageInput,
  UpdateCreditPackageInput,
} from './validators/credit-validators';

export {
  CreateAIModelSchema,
  UpdateAIModelSchema,
  AIModelProviderSchema,
  AIModelStatusSchema,
} from './validators/ai-model-validators';
export type {
  CreateAIModelInput,
  UpdateAIModelInput,
} from './validators/ai-model-validators';

// ─── Utils ────────────────────────────────────────────────────────────────────
export {
  AppError,
  ERROR_CODES,
  getErrorMessage,
  isAppError,
  toAppError,
} from './utils/error-handling';
export type { ErrorCode } from './utils/error-handling';

export {
  formatDate,
  formatDateTime,
  toISOString,
  formatRelativeTime,
} from './utils/date-formatting';

export {
  formatCredits,
  formatPriceCents,
  formatPriceUsd,
  formatGenerationCost,
  isBelowLowBalanceThreshold,
  getCreditBalanceLabel,
} from './utils/credit-formatting';

// ─── Constants ────────────────────────────────────────────────────────────────
export { API_BASE_PATH, API_V1_PATH, ROUTES, PAGINATION } from './constants/api-constants';

export {
  CREDIT_LIMITS,
  DEFAULT_CREDIT_COSTS,
  DEFAULT_CREDIT_PACKAGES,
  CREDIT_CURRENCY,
} from './constants/credit-constants';

// ─── UI Refactoring ────────────────────────────────────────────────────────────
export type {
  RefactoringStatus,
  StyleIssueType,
  LogicSafety,
  StyleIssue,
  StyleChanges,
  LogicValidation,
  ComponentAuditDto,
  RefactoringJobDto,
  ScanComponentsRequest,
  BeautifyComponentRequest,
  GeneratePrRequest,
  ComponentAuditListResponse,
  RefactoringJobListResponse,
} from './types/refactoring-types';

export {
  scanComponentsSchema,
  beautifyComponentSchema,
  generatePrSchema,
  refactoringJobQuerySchema,
} from './validators/refactoring-validators';
export type {
  ScanComponentsInput,
  BeautifyComponentInput,
  GeneratePrInput,
  RefactoringJobQueryInput,
} from './validators/refactoring-validators';

export {
  REFACTORING_DEFAULTS,
  REFACTORING_QUEUE_NAME,
  REFACTORING_JOB_OPTIONS,
  STYLE_ISSUE_LABELS,
  LOGIC_SAFETY_LABELS,
} from './constants/refactoring-constants';
