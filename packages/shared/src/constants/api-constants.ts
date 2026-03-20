/** Versioned API base paths */
export const API_BASE_PATH = '/api';
export const API_V1_PATH = `${API_BASE_PATH}/v1`;

/**
 * Route segments — build full URLs with API_V1_PATH + these.
 * These match the actual NestJS controller route decorators exactly.
 */
export const ROUTES = {
  AUTH: {
    WEBHOOK: '/webhooks/clerk',
  },
  USERS: {
    BASE: '/users',
    ME: '/users/me',
    BY_ID: (id: string) => `/users/${id}`,
    ROLE: (id: string) => `/admin/users/${id}/credits`,
    ADMIN_LIST: '/admin/users',
  },
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
  },
  GENERATIONS: {
    BASE: '/generate',
    BY_ID: (id: string) => `/generate/${id}`,
    BY_PROJECT: (projectId: string) => `/generate/project/${projectId}`,
  },
  /** @deprecated Use BILLING instead — no /credits controller exists */
  CREDITS: {
    BALANCE: '/billing/balance',
    HISTORY: '/billing/history',
    PURCHASE: '/billing/checkout',
  },
  BILLING: {
    CHECKOUT: '/billing/checkout',
    BALANCE: '/billing/balance',
    PACKAGES: '/billing/packages',
    HISTORY: '/billing/history',
    USAGE: '/billing/usage',
  },
  ADMIN_BILLING: {
    PACKAGES: '/admin/billing/packages',
    PACKAGE_BY_ID: (id: string) => `/admin/billing/packages/${id}`,
    ADJUST: '/admin/billing/adjust',
    ANALYTICS: '/admin/billing/analytics',
  },
  AI_MODELS: {
    BASE: '/models',
    BY_ID: (id: string) => `/models/${id}`,
    ADMIN_BASE: '/admin/models',
    ADMIN_BY_ID: (id: string) => `/admin/models/${id}`,
  },
  DESIGN_SYSTEMS: {
    BASE: '/design-systems',
    BY_ID: (id: string) => `/design-systems/${id}`,
    BY_PROJECT: (projectId: string) => `/design-systems/project/${projectId}`,
  },
  GITHUB: {
    CONNECT: '/github/connect',
    REPOS: '/github/repos',
    BRANCHES: (projectId: string) => `/github/branches/${projectId}`,
    SYNC: (connectionId: string) => `/github/sync/${connectionId}`,
    SYNC_DESIGN_TO_CODE: '/github/sync/design-to-code',
    SYNC_CODE_TO_DESIGN: '/github/sync/code-to-design',
    SYNC_STATUS: (projectId: string) => `/github/sync/status/${projectId}`,
    WEBHOOK: '/webhooks/github',
  },
  HEALTH: '/health',
} as const;

/** Default pagination settings */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
