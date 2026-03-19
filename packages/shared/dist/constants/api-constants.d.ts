/** Versioned API base paths */
export declare const API_BASE_PATH = "/api";
export declare const API_V1_PATH = "/api/v1";
/**
 * Route segments — build full URLs with API_V1_PATH + these.
 * These match the actual NestJS controller route decorators exactly.
 */
export declare const ROUTES: {
    readonly AUTH: {
        readonly WEBHOOK: "/webhooks/clerk";
    };
    readonly USERS: {
        readonly BASE: "/users";
        readonly ME: "/users/me";
        readonly BY_ID: (id: string) => string;
        readonly ROLE: (id: string) => string;
        readonly ADMIN_LIST: "/admin/users";
    };
    readonly PROJECTS: {
        readonly BASE: "/projects";
        readonly BY_ID: (id: string) => string;
    };
    readonly GENERATIONS: {
        readonly BASE: "/generate";
        readonly BY_ID: (id: string) => string;
        readonly BY_PROJECT: (projectId: string) => string;
    };
    readonly CREDITS: {
        readonly BALANCE: "/credits/balance";
        readonly HISTORY: "/credits/history";
        readonly PURCHASE: "/credits/purchase";
    };
    readonly BILLING: {
        readonly CHECKOUT: "/billing/checkout";
        readonly BALANCE: "/billing/balance";
        readonly PACKAGES: "/billing/packages";
        readonly HISTORY: "/billing/history";
        readonly USAGE: "/billing/usage";
    };
    readonly ADMIN_BILLING: {
        readonly PACKAGES: "/admin/billing/packages";
        readonly PACKAGE_BY_ID: (id: string) => string;
        readonly ADJUST: "/admin/billing/adjust";
        readonly ANALYTICS: "/admin/billing/analytics";
    };
    readonly AI_MODELS: {
        readonly BASE: "/models";
        readonly BY_ID: (id: string) => string;
        readonly ADMIN_BASE: "/admin/models";
        readonly ADMIN_BY_ID: (id: string) => string;
    };
    readonly DESIGN_SYSTEMS: {
        readonly BASE: "/design-systems";
        readonly BY_ID: (id: string) => string;
        readonly BY_PROJECT: (projectId: string) => string;
    };
    readonly GITHUB: {
        readonly CONNECT: "/github/connect";
        readonly REPOS: "/github/repos";
        readonly BRANCHES: (projectId: string) => string;
        readonly SYNC: (connectionId: string) => string;
        readonly SYNC_DESIGN_TO_CODE: "/github/sync/design-to-code";
        readonly SYNC_CODE_TO_DESIGN: "/github/sync/code-to-design";
        readonly SYNC_STATUS: (projectId: string) => string;
        readonly WEBHOOK: "/webhooks/github";
    };
    readonly HEALTH: "/health";
};
/** Default pagination settings */
export declare const PAGINATION: {
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
//# sourceMappingURL=api-constants.d.ts.map