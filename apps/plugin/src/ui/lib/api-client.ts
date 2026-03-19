/**
 * api-client.ts
 * Backend API calls from the plugin UI thread.
 * Wraps fetch with auth token injection and standard error handling.
 */

import { API_V1_PATH, ROUTES } from '@nexusui/shared';
import type { AIModelRef, DesignSystemTokenSet } from '@nexusui/shared';

const API_BASE = `https://api.nexusui.dev${API_V1_PATH}`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
}

export interface CreditBalance {
  balance: number;
  userId: string;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}

export interface SyncRequest {
  connectionId: string;
  direction: 'push' | 'pull';
  targetBranch: string;
  syncMode: 'pr' | 'direct';
  tokens?: DesignSystemTokenSet;
}

export interface SyncResult {
  status: string;
  commitSha?: string;
  prUrl?: string;
  message: string;
}

export interface GenerateRequest {
  projectId: string;
  modelId: string;
  prompt: string;
  variantCount: number;
  framework: string;
  designSystemId?: string;
}

export interface GenerateResult {
  id: string;
  status: string;
  variants: Array<{
    id: string;
    code: string;
    framework: string;
    previewImageUrl?: string;
  }>;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore parse error
    }
    const err: ApiError = { status: res.status, message };
    throw err;
  }

  return res.json() as Promise<T>;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/** Verify token is valid by fetching current user */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    await apiFetch(ROUTES.USERS.ME, token);
    return true;
  } catch {
    return false;
  }
}

/** Fetch available AI models */
export async function fetchModels(token: string): Promise<AIModelRef[]> {
  return apiFetch<AIModelRef[]>(ROUTES.AI_MODELS.BASE, token);
}

/** Fetch credit balance */
export async function fetchBalance(token: string): Promise<CreditBalance> {
  return apiFetch<CreditBalance>(ROUTES.CREDITS.BALANCE, token);
}

/** Fetch GitHub branches for a repo connection */
export async function fetchBranches(token: string, connectionId: string): Promise<GitHubBranch[]> {
  return apiFetch<GitHubBranch[]>(`/github/branches/${connectionId}`, token);
}

/** Push/pull sync with GitHub */
export async function syncGitHub(token: string, request: SyncRequest): Promise<SyncResult> {
  return apiFetch<SyncResult>(ROUTES.GITHUB.SYNC(request.connectionId), token, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/** Save design system tokens to API */
export async function saveDesignSystem(
  token: string,
  projectId: string,
  designSystemId: string | undefined,
  tokens: DesignSystemTokenSet,
): Promise<{ id: string }> {
  if (designSystemId) {
    return apiFetch(`${ROUTES.DESIGN_SYSTEMS.BY_ID(designSystemId)}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ tokens }),
    });
  }
  return apiFetch(ROUTES.DESIGN_SYSTEMS.BASE, token, {
    method: 'POST',
    body: JSON.stringify({ projectId, tokens, name: 'Figma Design System' }),
  });
}

/** Submit AI generation request */
export async function generateComponents(
  token: string,
  request: GenerateRequest,
): Promise<GenerateResult> {
  return apiFetch<GenerateResult>(ROUTES.GENERATIONS.BASE, token, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
