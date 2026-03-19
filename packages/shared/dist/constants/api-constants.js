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
        BY_ID: (id) => `/users/${id}`,
        ROLE: (id) => `/admin/users/${id}/credits`,
        ADMIN_LIST: '/admin/users',
    },
    PROJECTS: {
        BASE: '/projects',
        BY_ID: (id) => `/projects/${id}`,
    },
    GENERATIONS: {
        BASE: '/generate',
        BY_ID: (id) => `/generate/${id}`,
        BY_PROJECT: (projectId) => `/generate/project/${projectId}`,
    },
    CREDITS: {
        BALANCE: '/credits/balance',
        HISTORY: '/credits/history',
        PURCHASE: '/credits/purchase',
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
        PACKAGE_BY_ID: (id) => `/admin/billing/packages/${id}`,
        ADJUST: '/admin/billing/adjust',
        ANALYTICS: '/admin/billing/analytics',
    },
    AI_MODELS: {
        BASE: '/models',
        BY_ID: (id) => `/models/${id}`,
        ADMIN_BASE: '/admin/models',
        ADMIN_BY_ID: (id) => `/admin/models/${id}`,
    },
    DESIGN_SYSTEMS: {
        BASE: '/design-systems',
        BY_ID: (id) => `/design-systems/${id}`,
        BY_PROJECT: (projectId) => `/design-systems/project/${projectId}`,
    },
    GITHUB: {
        CONNECT: '/github/connect',
        REPOS: '/github/repos',
        BRANCHES: (projectId) => `/github/branches/${projectId}`,
        SYNC: (connectionId) => `/github/sync/${connectionId}`,
        SYNC_DESIGN_TO_CODE: '/github/sync/design-to-code',
        SYNC_CODE_TO_DESIGN: '/github/sync/code-to-design',
        SYNC_STATUS: (projectId) => `/github/sync/status/${projectId}`,
        WEBHOOK: '/webhooks/github',
    },
    HEALTH: '/health',
};
/** Default pagination settings */
export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};
//# sourceMappingURL=api-constants.js.map