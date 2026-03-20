# NexusUI — Codebase Summary

**Last Updated**: 2026-03-19 | **Status**: Implementation Complete (Phases 1-9)

## Overview
- **Total Files**: 230+ source files (TS/TSX)
- **Apps**: 3 (web, api, plugin)
- **Packages**: 3 (shared, database, ui)
- **Lines of Code**: ~14,000+ production code
- **Test Coverage**: 6 integration test suites, 60+ test cases

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, RSC)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State**: TanStack Query (React Query), Zustand
- **Auth**: Clerk (OAuth, JWT)
- **Build**: Turbo

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (ioredis)
- **Queue**: Bull (for AI generation jobs)
- **Real-time**: Socket.IO (WebSocket)
- **Auth**: Clerk JWT verification
- **Validation**: Zod + class-validator
- **HTTP**: Axios client, Stripe SDK

### Plugin
- **Framework**: Preact (32KB gzip)
- **Language**: TypeScript
- **Target**: Figma Plugin sandbox
- **Communication**: postMessage + fetch
- **Bundle**: ~142KB total (includes Figma API bridge)

### Database
- **Engine**: PostgreSQL 16+
- **ORM**: Prisma
- **Models**: 8 (User, Project, DesignSystem, AIModel, Generation, CreditLedger, CreditPackage, GitHubConnection)
- **Enums**: 6 (UserRole, ProjectStatus, AIModelProvider, GenerationStatus, CreditOperationType, SyncStatus)

### Infrastructure
- **Frontend Hosting**: Vercel (Next.js)
- **Backend Hosting**: Railway (NestJS, PostgreSQL, Redis)
- **Containerization**: Docker Compose (local dev)
- **CI/CD**: GitHub Actions
- **Code Hosting**: GitHub
- **Last Updated**: 2026-03-20

## File Structure

```
nexusui/
├── apps/
│   ├── web/                          # Next.js Dashboard (48 files)
│   │   ├── src/app/                  # App Router pages
│   │   │   ├── (auth)/               # Sign-in/up pages
│   │   │   ├── (dashboard)/          # Dashboard routes
│   │   │   │   ├── admin/            # Admin panel
│   │   │   │   ├── projects/         # Project management
│   │   │   │   │   └── [id]/refactor/# UI Refactoring pages
│   │   │   │   └── settings/         # User settings
│   │   │   └── page.tsx              # Landing page
│   │   ├── components/               # React components (35 files)
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   ├── project/              # Project detail components
│   │   │   ├── admin/                # Admin panel components
│   │   │   ├── credits/              # Billing UI components
│   │   │   ├── refactoring/          # UI Refactoring components (11 files)
│   │   │   └── layout/               # Reusable layout components
│   │   └── lib/                      # Utilities, hooks, API client
│   ├── api/                          # NestJS Backend (92 files)
│   │   ├── src/
│   │   │   ├── modules/              # 6 feature modules
│   │   │   │   ├── user/             # User management
│   │   │   │   ├── project/          # Project CRUD
│   │   │   │   ├── ai-generation/    # AI generation pipeline
│   │   │   │   ├── billing/          # Credit system + Stripe
│   │   │   │   ├── model-registry/   # Admin model config
│   │   │   │   ├── github-sync/      # GitHub bidirectional sync
│   │   │   │   └── ui-refactoring/   # UI component beautification
│   │   │   ├── common/               # Shared guards, decorators, pipes
│   │   │   ├── gateway/              # Socket.IO for real-time
│   │   │   └── config/               # App configuration
│   │   └── test/                     # Integration tests (6 suites)
│   └── plugin/                       # Figma Plugin (37 files)
│       ├── src/
│       │   ├── ui/                   # Preact components (12 files)
│       │   ├── code/                 # Plugin logic (Figma sandbox)
│       │   └── types/                # Plugin-specific types
│       └── manifest.json             # Figma plugin manifest
├── packages/
│   ├── shared/                       # Shared types, utilities (15 files)
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── utils/                    # Utility functions
│   │   ├── constants/                # Shared constants
│   │   └── validators/               # Zod validation schemas
│   ├── database/                     # Prisma schema (3 files)
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Database schema
│   │   └── src/                      # Generated Prisma client
│   └── ui/                           # Shared UI components (2 files)
├── docs/                             # Project documentation
├── plans/                            # Implementation plans & reports
└── turbo.json                        # Monorepo configuration
```

## API Modules

### 1. User Module
- Profile management
- Role-based access control (USER / ADMIN)
- Clerk webhook integration for user sync
- User listing (admin only)

### 2. Project Module
- CRUD operations for projects
- Figma file linking
- Project listing with pagination
- Archive/delete operations

### 3. AI Generation Module
- Multi-model AI support (Claude, GPT-4o, GPT-4 Turbo, Google Gemini)
- Design system context injection
- Credit deduction & metering
- Output parsing (code generation)
- Error handling & refunds
- Bull queue for async processing

### 4. Billing Module
- Credit balance tracking (CreditLedger)
- Stripe integration (checkout sessions, webhooks)
- Credit packages (configurable amounts & pricing)
- Purchase history
- Admin credit adjustment (refunds, grants)
- Low-balance detection

### 5. Model Registry Module
- Admin CRUD for AI models
- Credit cost per request configuration
- Model availability toggling
- Encrypted provider API key storage (AES-256)

### 6. GitHub Sync Module
- GitHub App OAuth flow
- Repository connection & branch selection
- Design-to-Code sync (generate React/Tailwind)
- Code-to-Design sync (parse components → Figma)
- PR creation with generated code
- Webhook signature verification
- Atomic credit deduction for generations

### 7. UI Refactoring Module
- Component scanning from GitHub repos
- AST-based style extraction (Babel parser)
- Style issue detection (spacing, colors, responsive, etc.)
- Logic preservation validation
- AI-powered component beautification (style-only)
- GitHub PR generation for refactored components
- Credit metering per component beautification
- Real-time status tracking via WebSocket

## Frontend Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Marketing, sign-in CTA |
| `/sign-in` | Auth | Clerk authentication |
| `/sign-up` | Auth | Clerk account creation |
| `/dashboard` | Dashboard | Overview, recent activity |
| `/projects` | Projects | Project list, create |
| `/projects/[id]` | Project Detail | Project management, design system, generations |
| `/projects/[id]/refactor` | Component Audit | UI refactoring, component scanning |
| `/projects/[id]/refactor/[componentId]` | Component Detail | Before/after preview, code diff, beautification |
| `/projects/[id]/refactor/queue` | Refactoring Queue | Job tracking, PR status |
| `/settings` | Settings | User preferences |
| `/settings/credits` | Billing | Credit packages, purchase, history |
| `/admin/models` | Models | AI model registry (admin) |
| `/admin/packages` | Packages | Credit package configuration (admin) |
| `/admin/users` | Users | User management (admin) |
| `/admin/analytics` | Analytics | Usage analytics, revenue (admin) |

## Database Schema

### Models (8 total)
1. **User** — Clerk-synced profiles, credit balance cache, role
2. **Project** — Workspace with Figma file link
3. **DesignSystem** — Color, typography, spacing, component tokens
4. **AIModel** — Registered models with encrypted API keys, credit cost
5. **Generation** — AI generation jobs with design system snapshot
6. **CreditLedger** — Append-only credit transaction history
7. **CreditPackage** — Purchasable credit bundles
8. **GitHubConnection** — GitHub repo links, sync status

### Enums (6 total)
- `UserRole`: USER, ADMIN
- `ProjectStatus`: ACTIVE, ARCHIVED, DELETED
- `AIModelProvider`: ANTHROPIC, OPENAI, GOOGLE, CUSTOM
- `GenerationStatus`: QUEUED, PROCESSING, COMPLETED, FAILED
- `CreditOperationType`: PURCHASE, GENERATION_DEDUCT, GENERATION_REFUND, ADMIN_ADJUSTMENT, INITIAL_GRANT
- `SyncStatus`: IDLE, SYNCING, ERROR

## Security Features

1. **Authentication**: Clerk OAuth + JWT verification
2. **Authorization**: Admin role guards on sensitive endpoints
3. **API Key Encryption**: AES-256 for AI provider credentials
4. **Credit Atomicity**: Transactions use database locks
5. **Webhook Verification**: Stripe signature validation
6. **GitHub App**: Secure OAuth flow with installation tracking
7. **Figma Plugin Sandbox**: Isolated main thread, iframe UI with CSP

## Testing

- **Integration Tests**: NestJS modules (app, user, billing, ai-generation, github-sync, ui-refactoring)
- **Test Framework**: Jest
- **Coverage**: 60+ test cases
- **No Mocks**: External services tested with real clients

## Performance Optimizations

- **Redis Caching**: User session cache, model registry cache
- **Bull Queue**: AI generation job queueing, concurrency control
- **Database Indexes**: userId, projectId, createdAt for fast queries
- **Cursor Pagination**: Efficient list fetching
- **WebSocket**: Real-time balance updates (Socket.IO)
- **Plugin Bundle**: ~142KB (Preact + Figma bridge)

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Redis 7+
- GitHub App (for OAuth)
- Clerk account
- Stripe account (for payments)

### Local Development
```bash
# Install dependencies
npm install

# Setup environment (.env from .env.example)
cp .env.example .env.local

# Run migrations
npm run db:migrate

# Start dev servers (Turbo)
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection
- `REDIS_URL` — Redis connection
- `CLERK_SECRET_KEY` — Clerk authentication
- `GITHUB_APP_ID` — GitHub App credentials
- `STRIPE_SECRET_KEY` — Stripe payments
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY` — AI providers

## Deployment

### Frontend (Vercel)
```bash
npm run build
npm run export
# Deploy via Vercel CLI or git push
```

### Backend (Railway)
```bash
# Docker Compose locally
docker-compose up

# Deploy to Railway via git push
git push railway main
```

### Database Migrations (Prisma)
```bash
npm run db:deploy
```

## Key Metrics

- **Codebase**: 230+ source files, 14,000+ LOC
- **Build Time**: ~30s (Turbo cache)
- **Bundle Size**: Web ~180KB (gzip), Plugin ~142KB
- **API Response Time**: <100ms (cached)
- **Test Execution**: <15s (Jest, parallel, 6 suites)
- **Deployment**: <5min (Vercel + Railway)
