/**
 * DTOs for sync status and results returned from sync endpoints.
 */

/** Result returned from design→code sync */
export interface DesignToCodeResult {
  syncMode: 'pr' | 'direct-commit';
  /** PR URL (when syncMode = 'pr') */
  prUrl?: string;
  /** Commit SHA (when syncMode = 'direct-commit') */
  commitSha?: string;
  branch: string;
  filesChanged: number;
}

/** Figma-renderable node returned from code→design sync */
export interface FigmaNode {
  type: 'FRAME' | 'TEXT' | 'RECTANGLE' | 'GROUP';
  name: string;
  children?: FigmaNode[];
  // AutoLayout properties
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  itemSpacing?: number;
  // Visual
  fills?: Array<{ type: string; color: { r: number; g: number; b: number } }>;
  strokes?: Array<{ type: string; color: { r: number; g: number; b: number } }>;
  // Text
  characters?: string;
  fontSize?: number;
  fontWeight?: number;
  // Dimensions
  width?: number;
  height?: number;
}

/** Design tokens extracted from code */
export interface ExtractedDesignTokens {
  colors: Record<string, string>;
  typography: Record<string, { fontFamily?: string; fontSize?: string; fontWeight?: string }>;
  spacing: Record<string, string>;
}

/** Result returned from code→design sync */
export interface CodeToDesignResult {
  componentTree: FigmaNode[];
  designTokens: ExtractedDesignTokens;
  filesScanned: number;
}

/** Current sync status for a project */
export interface SyncStatusDto {
  projectId: string;
  syncStatus: string;
  lastSyncAt: Date | null;
  repoOwner: string;
  repoName: string;
  branch: string;
}
