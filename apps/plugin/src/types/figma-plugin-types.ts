/**
 * figma-plugin-types.ts
 * All plugin-specific types for NexusUI Figma plugin.
 * Shared types (DesignSystem, AIModelRef, etc.) imported from @nexusui/shared.
 */

import type {
  ColorToken,
  TypographyToken,
  SpacingToken,
  DesignSystemTokenSet,
} from '@nexusui/shared';

export type { ColorToken, TypographyToken, SpacingToken, DesignSystemTokenSet };

// ─── Plugin Message Protocol ─────────────────────────────────────────────────

/** All message types exchanged between code.ts and UI thread */
export type PluginMessageType =
  | 'INIT'
  | 'AUTH_GET'
  | 'AUTH_SET'
  | 'AUTH_RESULT'
  | 'EXTRACT_TOKENS'
  | 'TOKENS_EXTRACTED'
  | 'INSERT_DESIGN'
  | 'RENDER_COMPONENT'
  | 'CANVAS_CHANGED'
  | 'ERROR'
  | 'ACK';

export interface PluginMessage<T = unknown> {
  /** Unique message ID for ack/response correlation */
  id: string;
  type: PluginMessageType;
  payload?: T | undefined;
}

export interface PluginMessageAck {
  id: string;
  type: 'ACK';
  success: boolean;
  error?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthSetPayload {
  token: string;
}

export interface AuthResultPayload {
  token: string | null;
}

// ─── Design Tokens ───────────────────────────────────────────────────────────

export interface TokensExtractedPayload {
  tokens: DesignSystemTokenSet;
}

// ─── Canvas Changes ──────────────────────────────────────────────────────────

export type ChangeCategory = 'color' | 'typography' | 'spacing' | 'layout' | 'other';

export interface CanvasChange {
  nodeId: string;
  nodeName: string;
  category: ChangeCategory;
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface CanvasChangedPayload {
  changes: CanvasChange[];
}

// ─── Component Tree (for canvas rendering) ───────────────────────────────────

export type ComponentNodeType = 'FRAME' | 'TEXT' | 'RECTANGLE' | 'AUTOLAYOUT';

export interface ComponentNode {
  type: ComponentNodeType;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fills?: Array<{ r: number; g: number; b: number; a?: number }>;
  cornerRadius?: number;
  children?: ComponentNode[];
  // AutoLayout props
  layoutMode?: 'HORIZONTAL' | 'VERTICAL';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

export interface RenderComponentPayload {
  root: ComponentNode;
  /** If provided, insert near this node ID */
  referenceNodeId?: string;
}

// ─── Plugin UI State ──────────────────────────────────────────────────────────

export type TabId = 'design-system' | 'ai-generate' | 'sync';

export interface SyncLogEntry {
  id: string;
  timestamp: Date;
  direction: 'push' | 'pull';
  message: string;
  status: 'success' | 'error' | 'pending';
}

export type SyncMode = 'pr' | 'direct';

export interface GenerateFormState {
  prompt: string;
  modelId: string;
  variantCount: number;
  framework: 'react' | 'vue' | 'svelte' | 'html';
  projectId: string;
  designSystemId?: string | undefined;
}

export interface VariantPreview {
  id: string;
  code: string;
  framework: string;
  previewImageUrl?: string;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export interface WsEvent<T = unknown> {
  event: string;
  data: T;
}

export interface BalanceUpdateEvent {
  balance: number;
}
