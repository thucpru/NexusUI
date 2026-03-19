# NexusUI — System Architecture

**Status**: ✅ FULLY IMPLEMENTED | **Last Updated**: 2026-03-19

## High-Level Architecture

```
┌─────────────────────────────────┐
│    Figma Web Application        │
│  ┌───────────────────────────┐  │
│  │  NexusUI Figma Plugin     │  │
│  │  (TypeScript + Preact)    │  │
│  │  - Design system editor   │  │
│  │  - AI generation UI       │  │
│  │  - Sync controls          │  │
│  └──────────┬────────────────┘  │
│             │ postMessage/fetch  │
└─────────────┼───────────────────┘
              │ HTTPS
        ┌─────▼────────────────────┐
        │  Web Dashboard (Next.js) │
        │  - Auth (Clerk)          │
        │  - Billing (Stripe)      │
        │  - Project management    │
        │  - Credit balance/usage  │
        │  - Admin panel (models)  │
        └─────┬────────────────────┘
              │ REST / WebSocket
        ┌─────▼────────────────────┐
        │  API Server (NestJS)     │
        │  - Auth middleware       │
        │  - Design token service  │
        │  - AI generation service │
        │  - GitHub sync service   │
        │  - Credit/billing service│
        │  - Model registry service│
        │  - Real-time (Socket.IO) │
        └─────┬────────────────────┘
              │
     ┌────────┼────────────┐
     │        │            │
┌────▼───┐ ┌──▼────┐ ┌────▼─────┐
│PostgreSQL│ │Redis  │ │Bull Queue│
│(Prisma) │ │Cache  │ │AI Jobs   │
└─────────┘ └───────┘ └──────────┘
```

## Component Details

### Figma Plugin (packages/plugin) — ✅ COMPLETE
- **Runtime**: Figma sandbox (main thread + iframe UI)
- **Framework**: Preact (32KB gzip, <200KB total with bridge)
- **Communication**: postMessage → fetch to NexusUI API, WebSocket for real-time
- **UI Components** (12 files):
  - PluginHeader, AuthScreen, ModelSelector
  - DesignSystemTab, AIGenerateTab, SyncControlsTab
  - ColorTokenList, TypographyTokenList, SpacingTokenList
  - VariantPreviewCard, BranchSelector, SyncLogEntry
  - CreditBalanceFooter, UnsavedChangesBadge
- **Features**: Design system editor, AI prompt input, model selection, sync controls, credit balance
- **Integration**: Canvas change detection, WebSocket subscriptions, OAuth flow

### Web Dashboard (packages/web) — ✅ COMPLETE
- **Framework**: Next.js 15 (App Router, RSC, streaming)
- **Files**: 48 source files (pages, components, hooks, utilities)
- **Auth**: Clerk (OAuth, session management, role-based routes)
- **Payments**: Stripe (checkout sessions, credit purchases)
- **UI**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Pages** (7 main routes):
  - `/` — Landing page with hero, features, pricing
  - `/dashboard` — Overview, stats, activity feed
  - `/projects` — Project CRUD, list view
  - `/projects/[id]` — Project detail, design system, generations
  - `/settings` — User preferences
  - `/settings/credits` — Billing, purchase history
  - `/admin/*` — Admin panel (models, packages, users, analytics)
- **Components** (24 files):
  - Dashboard (ProjectCard, StatsCard, ActivityFeed, CreditUsageChart)
  - Projects (ProjectHeader, DesignSystemPreview, GenerationHistoryList, SyncStatusIndicator)
  - Admin (ModelRegistryTable, PackageConfigTable, UserManagementTable, AnalyticsDashboard, FormDialogs)
  - Credits (CreditPackageCard, CreditHistoryTable, CreditBalanceBar)
  - Layout (SidebarNavigation, TopbarNavigation, CreditBalanceDisplay)
- **Hooks** (5 files):
  - useProjects, useGenerations, useCreditBalance, useAIModels, useAdmin
- **State**: TanStack Query for server state, session via Clerk

### API Server (packages/api) — ✅ COMPLETE
- **Framework**: NestJS (TypeScript, DI containers, modules)
- **Files**: 92 source files
- **Auth**: Clerk JWT verification middleware, role-based guards
- **Database**: PostgreSQL via Prisma ORM with indexes
- **Queue**: Bull (Redis-backed) for AI generation jobs
- **Real-time**: Socket.IO for plugin↔backend updates
- **6 Feature Modules**:

#### 1. User Module
- `UserService`: Profile management, role checks
- `UserController`: GET /users/{id}, list users (admin)
- `AdminUserController`: User adjustment, refunds
- `UserWebhookController`: Clerk webhooks for sync
- Integration: Clerk OAuth, JWT verification

#### 2. Project Module
- `ProjectService`: CRUD, Figma file linking, pagination
- `ProjectController`: Endpoints for project management
- Routes: `POST /projects`, `GET /projects`, `GET /projects/{id}`, `PUT /projects/{id}`, `DELETE /projects/{id}`

#### 3. AI Generation Module (Most Complex)
- `AIGenerationService`: Main orchestration
- `AIGenerationProcessor`: Bull queue job handler
- `DesignSystemContextBuilder`: Token injection
- `PromptBuilderService`: Model-specific prompts
- `OutputParserService`: Code parsing & validation
- `FigmaNodeConverterService`: Design→Figma mapping
- `EncryptionService`: AES-256 API key encryption
- **Providers** (3 implementations + factory):
  - `AnthropicProvider`: Claude models
  - `OpenAIProvider`: GPT-4, GPT-4 Turbo
  - `AIProviderFactory`: Dynamic provider selection
- Routes: `POST /ai-generation/generate`, `GET /generations`
- Credit metering: Deducts before processing, refunds on error

#### 4. Billing Module
- `BillingService`: Main billing logic
- `CreditBalanceService`: Balance tracking & caching
- `CreditMeteringService`: Transaction recording
- `CreditPackageService`: Package CRUD
- `StripeCheckoutService`: Stripe session creation
- `StripeWebhookService`: Payment confirmation
- `InitialGrantService`: New user onboarding credits
- `BillingController`: User endpoints (balance, history, purchase)
- `BillingAdminController`: Admin endpoints (packages, adjustments)
- Routes: `GET /billing/balance`, `POST /billing/checkout`, `GET /billing/history`

#### 5. Model Registry Module
- `ModelRegistryService`: CRUD with caching
- `ModelRegistryController`: Admin endpoints
- Routes: `GET /models`, `POST /models`, `PUT /models/{id}`, `DELETE /models/{id}`
- Features: Enable/disable models, set credit cost, manage API keys

#### 6. GitHub Sync Module (Most Complex)
- `GitHubSyncService`: Main orchestration
- `GitHubAppAuthService`: GitHub OAuth, installation handling
- `GitHubBranchService`: Branch creation & management
- `GitHubRepoReaderService`: Code parsing
- `ComponentTreeBuilder`: Extracts components from code
- `CodeParser`: AST parsing (React, Vue, Tailwind)
- `CodeGeneratorService`: Generates code from design tokens
- `ComponentToFigmaMapperService`: Maps code→design tokens
- `CodeToDesignSyncService`: Orchestrates Code→Design
- `DesignToCodeSyncService`: Orchestrates Design→Code
- `GitHubWebhookHandlerService`: Webhook processing
- `TailwindTokenMaps`: Token mapping for Tailwind
- Routes: `POST /sync/design-to-code`, `POST /sync/code-to-design`, `POST /webhooks/github`
- Features: Bidirectional sync, PR creation, conflict handling

#### Common Infrastructure
- **Guards**: `ClerkAuthGuard` (JWT), `AdminRoleGuard`
- **Decorators**: `@CurrentUser`, `@Roles`
- **Pipes**: `ZodValidationPipe` for request validation
- **Filters**: `GlobalExceptionFilter` for error handling
- **Interceptors**: `LoggingInterceptor` for request/response logging
- **Real-time Gateway**: `RealtimeGateway` for Socket.IO connections

### Database (packages/database) — ✅ COMPLETE
- **Schema**: 8 models, 6 enums
- **Models**:
  - User (clerk-synced, role, credit balance)
  - Project (workspace, Figma link)
  - DesignSystem (design tokens: color, typography, spacing, component)
  - AIModel (registered models, credit cost, encrypted API keys)
  - Generation (AI jobs, design snapshot, status)
  - CreditLedger (append-only audit log)
  - CreditPackage (purchasable credit bundles)
  - GitHubConnection (repo links, sync status)
- **Indexes**: Optimized for common queries (userId, projectId, createdAt)
- **Migrations**: All 8 migrations applied

### Shared Package (packages/shared) — ✅ COMPLETE
- **Files**: 15 source files
- **Types**: TypeScript interfaces for all DTOs, domain models
- **Validators**: Zod schemas for request validation
- **Utils**: Utility functions (token formatting, date handling, etc.)
- **Constants**: Shared constants & enums

## Data Flow

### Design→Code Sync (Implemented Phase 6)
1. User triggers sync in Figma plugin (SyncControlsTab)
2. Plugin reads design nodes → serializes to JSON via FigmaNodeConverterService
3. Sends to API `POST /sync/design-to-code` with design snapshot
4. API DesignToCodeSyncService:
   - Validates design nodes
   - Extracts tokens (colors, typography, spacing)
   - Calls CodeGeneratorService → generates React/Tailwind code
   - Creates GitHub branch via GitHubBranchService
   - Commits code changes
   - Opens PR via GitHub API
5. User merges PR in GitHub
6. Plugin receives confirmation via WebSocket

### Code→Design Sync (Implemented Phase 6)
1. GitHub webhook triggers on push/merge
2. API GitHubWebhookHandlerService receives webhook
3. Verifies webhook signature (security)
4. CodeToDesignSyncService:
   - Parses changed files (ComponentTreeBuilder, CodeParserService)
   - Extracts component tree, CSS, Tailwind classes
   - Maps code tokens → design tokens (ComponentToFigmaMapperService)
   - Creates Figma nodes via FigmaNodeConverterService
   - Updates Figma file via Figma REST API
5. Plugin receives update via WebSocket
6. Plugin refreshes to show design changes

### AI Generation (Implemented Phase 3)
1. User enters prompt + selects AI model in plugin (AIGenerateTab)
2. Plugin sends to API `POST /ai-generation/generate` with:
   - prompt, aiModelId, designSystemSnapshot
   - model selection (Claude, GPT-4, etc.)
3. API AIGenerationService:
   - Validates request (ZodValidationPipe)
   - Checks credit balance via CreditBalanceService
   - **Atomically deducts credits** based on selected model's rate (CreditMeteringService)
   - Builds design system context (DesignSystemContextBuilder)
   - Builds model-specific prompt (PromptBuilderService)
   - Queues job via Bull (AIGenerationProcessor)
4. Bull processor:
   - Calls AI provider (AnthropicProvider, OpenAIProvider, etc. via AIProviderFactory)
   - Parses output (OutputParserService) → code + variants
   - Converts to Figma nodes (FigmaNodeConverterService)
   - Stores result in database (Generation model)
5. WebSocket notifies plugin of completion
6. Plugin renders variants in Figma canvas
7. **On error**: Credits refunded via CreditMeteringService

### Credit Purchase (Implemented Phase 4)
1. User selects credit package in dashboard (CreditPackageCard)
2. Dashboard calls API `POST /billing/checkout` with packageId
3. StripeCheckoutService creates Stripe session
4. User completes payment on Stripe
5. Stripe webhook `charge.succeeded` → API StripeWebhookService
6. Creates CreditLedger entry (PURCHASE operation)
7. Updates User.creditBalance cache
8. Plugin receives balance update via WebSocket (RealtimeGateway)

### Admin Model & Pricing Management (Implemented Phase 5)
1. Admin navigates to `/admin/models` page
2. Admin CRUD via ModelRegistryController:
   - `POST /models` — Add new model (e.g., GPT-4)
   - `PUT /models/{id}` — Update credit cost
   - `DELETE /models/{id}` — Deactivate model
3. Models cached in Redis for fast retrieval
4. AIProviderFactory dynamically selects provider based on model slug
5. Changes take effect immediately — active models available in plugin
6. Admin monitors analytics:
   - `/admin/analytics` dashboard
   - Usage stats, popular models, revenue per model
   - Credit spend by user (UserManagementTable)

## Integration Points

| Component | Integrates With | Method | Purpose |
|-----------|-----------------|--------|---------|
| Plugin | API | HTTPS + WebSocket | Send prompts, sync designs, receive updates |
| Plugin | Figma API | Native Figma Plugin API | Read/write design nodes |
| Web | API | REST + WebSocket | Manage projects, purchase credits, view analytics |
| Web | Clerk | OAuth + JWT | User authentication, role checks |
| Web | Stripe | REST API | Credit checkout, payment processing |
| API | PostgreSQL | Prisma ORM | Persist all data |
| API | Redis | ioredis | Cache models, sessions, rate limits |
| API | Bull | Job queue | Queue AI generation jobs |
| API | GitHub | REST API + OAuth | Repo auth, branch creation, PR submission |
| API | GitHub Webhooks | HTTPS callbacks | Code change notifications |
| API | Stripe Webhooks | HTTPS callbacks | Payment confirmations |
| API | Clerk Webhooks | HTTPS callbacks | User sync updates |
| API | AI Providers | REST API | Call Claude, GPT-4, Gemini, etc. |

## Infrastructure
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (NestJS + PostgreSQL + Redis)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Railway logs
