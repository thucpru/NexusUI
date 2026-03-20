// ─── UI Refactoring Types ─────────────────────────────────────────────────────

/** Lifecycle states a refactoring job can be in */
export type RefactoringStatus =
  | 'PENDING'
  | 'SCANNING'
  | 'ANALYZED'
  | 'BEAUTIFYING'
  | 'VALIDATING'
  | 'PR_CREATED'
  | 'COMPLETED'
  | 'FAILED';

/** Categories of style issues detected during component analysis */
export type StyleIssueType =
  | 'INCONSISTENT_SPACING'
  | 'OUTDATED_CLASSES'
  | 'MISSING_RESPONSIVE'
  | 'POOR_CONTRAST'
  | 'INLINE_STYLES'
  | 'HARDCODED_COLORS'
  | 'NO_DESIGN_TOKENS';

/** Risk level for logic modifications during refactoring */
export type LogicSafety = 'SAFE' | 'RISKY' | 'MANUAL_REVIEW';

/** A single style issue found in a component */
export interface StyleIssue {
  type: StyleIssueType;
  detail: string;
  line?: number;
}

/** Summary of CSS/class changes applied during beautification */
export interface StyleChanges {
  added: string[];
  removed: string[];
  modified: string[];
}

/** Result of logic-safety analysis before applying changes */
export interface LogicValidation {
  safe: boolean;
  warnings: string[];
}

/** Audit result for a single component file */
export interface ComponentAuditDto {
  id: string;
  filePath: string;
  componentName: string;
  styleIssues: StyleIssue[];
  issueCount: number;
  estimatedCredits: number;
  logicSafety: LogicSafety;
  lastScannedAt: string;
}

/** Full state of a refactoring job */
export interface RefactoringJobDto {
  id: string;
  projectId: string;
  componentPath: string;
  componentName: string;
  status: RefactoringStatus;
  beforeCode?: string;
  afterCode?: string;
  diffPreview?: string;
  styleChanges?: StyleChanges;
  logicValidation?: LogicValidation;
  creditsUsed: number;
  githubPrUrl?: string;
  githubBranch?: string;
  errorMessage?: string;
  createdAt: string;
}

// ─── Request Types ─────────────────────────────────────────────────────────────

/** Payload to trigger a component scan for a project */
export interface ScanComponentsRequest {
  projectId: string;
  branch?: string;
  paths?: string[];
}

/** Payload to beautify a single component */
export interface BeautifyComponentRequest {
  projectId: string;
  componentPath: string;
  aiModelId: string;
  designSystemId?: string;
}

/** Payload to open a GitHub PR for completed refactoring jobs */
export interface GeneratePrRequest {
  projectId: string;
  jobIds: string[];
  branchName?: string;
}

// ─── Response Types ────────────────────────────────────────────────────────────

/** List response for component audits */
export interface ComponentAuditListResponse {
  components: ComponentAuditDto[];
  totalIssues: number;
  totalComponents: number;
}

/** List response for refactoring jobs */
export interface RefactoringJobListResponse {
  jobs: RefactoringJobDto[];
  total: number;
}
