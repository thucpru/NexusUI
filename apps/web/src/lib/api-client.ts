import { API_V1_PATH, ROUTES } from '@nexusui/shared';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

/** Builds full API URL from a path segment */
function buildUrl(path: string): string {
  return `${API_BASE_URL}${API_V1_PATH}${path}`;
}

/** Shared fetch wrapper — attaches Clerk session token as Bearer */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  getToken?: () => Promise<string | null>,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (getToken) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(buildUrl(path), { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/** Creates an API client bound to the user's session token getter */
export function createApiClient(getToken: () => Promise<string | null>) {
  return {
    // ─── Users ────────────────────────────────────────────────────────────────
    getMe: () => apiFetch(ROUTES.USERS.ME, {}, getToken),
    updateMe: (body: unknown) =>
      apiFetch(ROUTES.USERS.ME, { method: 'PATCH', body: JSON.stringify(body) }, getToken),

    // ─── Projects ─────────────────────────────────────────────────────────────
    getProjects: () => apiFetch(ROUTES.PROJECTS.BASE, {}, getToken),
    getProject: (id: string) => apiFetch(ROUTES.PROJECTS.BY_ID(id), {}, getToken),
    createProject: (body: unknown) =>
      apiFetch(ROUTES.PROJECTS.BASE, { method: 'POST', body: JSON.stringify(body) }, getToken),
    updateProject: (id: string, body: unknown) =>
      apiFetch(ROUTES.PROJECTS.BY_ID(id), { method: 'PATCH', body: JSON.stringify(body) }, getToken),
    deleteProject: (id: string) =>
      apiFetch(ROUTES.PROJECTS.BY_ID(id), { method: 'DELETE' }, getToken),

    // ─── Billing / Credits ────────────────────────────────────────────────────
    getCreditBalance: () => apiFetch(ROUTES.BILLING.BALANCE, {}, getToken),
    getCreditHistory: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`${ROUTES.BILLING.HISTORY}${qs}`, {}, getToken);
    },
    // Alias for backward compatibility with useCreditLedger hook
    getCreditLedger: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`${ROUTES.BILLING.HISTORY}${qs}`, {}, getToken);
    },
    getCreditPackages: () => apiFetch(ROUTES.BILLING.PACKAGES, {}, getToken),
    purchaseCredits: (body: unknown) =>
      apiFetch(ROUTES.BILLING.CHECKOUT, { method: 'POST', body: JSON.stringify(body) }, getToken),
    getCreditUsage: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`${ROUTES.BILLING.USAGE}${qs}`, {}, getToken);
    },

    // ─── Generations ──────────────────────────────────────────────────────────
    getGenerations: (params?: Record<string, string>) => {
      // Route by projectId if provided, else get all (admin)
      const projectId = params?.['projectId'];
      if (projectId) return apiFetch(ROUTES.GENERATIONS.BY_PROJECT(projectId), {}, getToken);
      return apiFetch(ROUTES.GENERATIONS.BASE, {}, getToken);
    },
    getGeneration: (id: string) => apiFetch(ROUTES.GENERATIONS.BY_ID(id), {}, getToken),
    createGeneration: (body: unknown) =>
      apiFetch(ROUTES.GENERATIONS.BASE, { method: 'POST', body: JSON.stringify(body) }, getToken),

    // ─── AI Models ────────────────────────────────────────────────────────────
    getAIModels: () => apiFetch(ROUTES.AI_MODELS.BASE, {}, getToken),

    // ─── Admin — Users ────────────────────────────────────────────────────────
    getUsers: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`${ROUTES.USERS.ADMIN_LIST}${qs}`, {}, getToken);
    },
    updateUserRole: (id: string, body: unknown) =>
      apiFetch(ROUTES.USERS.ROLE(id), { method: 'PATCH', body: JSON.stringify(body) }, getToken),

    // ─── Admin — Models ───────────────────────────────────────────────────────
    getAdminModels: () => apiFetch(ROUTES.AI_MODELS.ADMIN_BASE, {}, getToken),
    createAIModel: (body: unknown) =>
      apiFetch(ROUTES.AI_MODELS.ADMIN_BASE, { method: 'POST', body: JSON.stringify(body) }, getToken),
    updateAIModel: (id: string, body: unknown) =>
      apiFetch(ROUTES.AI_MODELS.ADMIN_BY_ID(id), { method: 'PATCH', body: JSON.stringify(body) }, getToken),
    deleteAIModel: (id: string) =>
      apiFetch(ROUTES.AI_MODELS.ADMIN_BY_ID(id), { method: 'DELETE' }, getToken),

    // ─── Admin — Analytics ────────────────────────────────────────────────────
    getAdminStats: () => apiFetch(ROUTES.ADMIN_BILLING.ANALYTICS, {}, getToken),
    getModelUsage: () => apiFetch(ROUTES.ADMIN_BILLING.ANALYTICS, {}, getToken),
    getRevenue: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`${ROUTES.ADMIN_BILLING.ANALYTICS}${qs}`, {}, getToken);
    },

    // ─── Admin — Billing ──────────────────────────────────────────────────────
    adminAdjustCredits: (body: unknown) =>
      apiFetch(ROUTES.ADMIN_BILLING.ADJUST, { method: 'POST', body: JSON.stringify(body) }, getToken),
    getAdminAnalytics: () => apiFetch(ROUTES.ADMIN_BILLING.ANALYTICS, {}, getToken),
    createCreditPackage: (body: unknown) =>
      apiFetch(ROUTES.ADMIN_BILLING.PACKAGES, { method: 'POST', body: JSON.stringify(body) }, getToken),
    updateCreditPackage: (id: string, body: unknown) =>
      apiFetch(ROUTES.ADMIN_BILLING.PACKAGE_BY_ID(id), { method: 'PATCH', body: JSON.stringify(body) }, getToken),
    deleteCreditPackage: (id: string) =>
      apiFetch(ROUTES.ADMIN_BILLING.PACKAGE_BY_ID(id), { method: 'DELETE' }, getToken),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
