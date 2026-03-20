# NexusUI — Project Changelog

All notable changes to NexusUI are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/).

## [1.1.0] — 2026-03-20

### ✅ RELEASED — UI Refactoring Feature

#### 🎉 Features
- **UI Refactoring Module**: New NestJS module for component beautification
  - ComponentScannerService — Scans GitHub repos for React components
  - StyleExtractionService — AST-based style extraction using Babel & @babel/generator
  - RefactorValidatorService — Validates style-only changes preserve component logic
  - RefactoringProcessor — Bull queue for async AI-powered beautification
  - RefactoringPrService — Auto-generates GitHub PRs with style-only diffs
  - UIRefactoringService — Main service orchestration
- **Database Models**: RefactoringJob, ComponentAudit with StyleIssueType enum
- **Frontend Pages** (3 new routes):
  - `/projects/[id]/refactor` — Component Audit page with scanning, filtering, batch selection
  - `/projects/[id]/refactor/[componentId]` — Component Detail page with before/after preview, code diff, logic safety indicator
  - `/projects/[id]/refactor/queue` — Refactoring Queue page with job tracking and PR links
- **Components** (11 new):
  - ComponentAuditCard, ComponentAuditFilters, ComponentAuditGrid
  - BeforeAfterPreview, CodeDiffViewer, LogicSafetyBadge, TokenMappingPanel, BeautifyActionBar
  - RefactoringJobList, RefactoringJobCard, ScanTriggerButton
- **API Endpoints**:
  - `POST /refactoring/:projectId/scan` — Scan repo for components
  - `GET /refactoring/:projectId/components` — List component audits
  - `GET /refactoring/:projectId/components/:id` — Component audit detail
  - `POST /refactoring/:projectId/beautify` — Start beautification job
  - `GET /refactoring/:projectId/jobs` — List refactoring jobs
  - `GET /refactoring/:projectId/jobs/:id` — Job detail with diff preview
  - `POST /refactoring/:projectId/generate-pr` — Generate PR from completed jobs
- **Shared Types**: RefactoringStatus, StyleIssueType enums; DTOs for all endpoints
- **AI Integration**: Leverages existing AIGenerationService with refactoring-specific prompts
- **Credit Metering**: Charges credits per component beautification (configurable)
- **Security**: Project ownership verification, input validation, logic safety validation

#### 🐛 Bug Fixes
- None (feature release)

#### 🔒 Security
- Logic preservation validation prevents AI from changing component behavior
- AST-based diff comparison ensures style-only changes
- Project ownership checks on all endpoints
- Input validation for component paths and AI model selection

#### 📚 Documentation
- Updated system-architecture.md with Module 7 (UI Refactoring)
- Updated development-roadmap.md with Phase 10 (complete)
- Phase documentation in plans/260320-ui-refactoring-feature/

#### 🧪 Testing
- Integration test suite (ui-refactoring.integration.spec.ts)
- 15+ test cases covering:
  - Component scanning and audit creation
  - Style extraction and issue detection
  - Beautification pipeline (end-to-end)
  - Logic validation and error handling
  - PR generation and batch operations
  - Credit deduction verification
- All tests passing

#### 📊 Metrics
- **Database**: 2 new models (RefactoringJob, ComponentAudit), 1 new enum (RefactoringStatus, StyleIssueType)
- **Backend**: 6 new services (~1,000 LOC), 1 new controller (~150 LOC)
- **Frontend**: 11 new components (~1,100 LOC), 3 new pages (~220 LOC), 1 custom hook (~100 LOC)
- **Test Coverage**: 15 test cases for UI refactoring module
- **npm Packages**: 2 new (@babel/generator, diff-match-patch)

## [1.0.0] — 2026-03-19

### ✅ RELEASED — Production Ready

#### 🎉 Features
- **Core SaaS Platform**: Complete NexusUI platform with Figma plugin, web dashboard, and NestJS API
- **Figma Plugin**: Preact-based plugin (32KB gzip) for design system management and AI generation
  - Design token editor (colors, typography, spacing)
  - AI generation with multi-model support
  - Bidirectional GitHub sync controls
  - Real-time credit balance display
  - Canvas change detection & auto-save
  - WebSocket integration for live updates
  - OAuth authentication
  - 12 UI components, <200KB total bundle
- **Web Dashboard**: Next.js 15 dashboard with 48 source files
  - Landing page with hero, features, pricing
  - User authentication (Clerk OAuth)
  - Project management (CRUD)
  - Design system visualization
  - AI generation history
  - Billing & credit purchase
  - Admin panel for models, packages, users, analytics
  - Dark/light theme support
  - Responsive design (mobile-first)
- **API Server**: NestJS backend with 6 feature modules
  - User management & role-based access control
  - Project CRUD & Figma linking
  - AI Generation pipeline with multi-model support (Claude, GPT-4, GPT-4 Turbo, Google Gemini)
  - Billing system with Stripe integration
  - Credit metering & atomic transactions
  - Model registry with encrypted API keys
  - GitHub bidirectional sync (Design↔Code)
  - Real-time updates via Socket.IO
- **Database**: PostgreSQL with Prisma ORM
  - 8 models: User, Project, DesignSystem, AIModel, Generation, CreditLedger, CreditPackage, GitHubConnection
  - 6 enums: UserRole, ProjectStatus, AIModelProvider, GenerationStatus, CreditOperationType, SyncStatus
  - Optimized indexes for performance
  - Append-only CreditLedger for audit trail
- **AI Generation**:
  - Multi-model provider support (Claude, GPT-4, Gemini)
  - Design system context injection
  - Bull queue for async job processing
  - Output parsing & code generation (React/Tailwind)
  - Error handling with credit refunds
  - Credit metering based on model selection
- **Billing**:
  - Prepaid credit system
  - Stripe integration for payments
  - Configurable credit packages ($10, $50, $100, $500)
  - Admin credit adjustment & refunds
  - Real-time balance tracking
  - Purchase history
  - Initial grant for new users
- **GitHub Integration**:
  - GitHub App OAuth flow
  - Repository connection & branch selection
  - Design-to-Code sync (generate React/Tailwind from Figma)
  - Code-to-Design sync (parse components → Figma)
  - PR creation with generated code
  - Webhook signature verification
  - Atomic credit deduction for generations
- **Admin Panel**:
  - AI model registry with CRUD
  - Credit package configuration
  - User management & balance adjustment
  - Analytics dashboard (revenue, popular models, user spending)
  - Model availability toggling
  - Encrypted API key storage
- **Security**:
  - AES-256 encryption for API keys
  - Clerk JWT verification
  - Admin role guards on sensitive endpoints
  - Webhook signature verification (GitHub, Stripe)
  - Atomic credit transactions
  - Input validation (Zod + class-validator)
  - CORS configuration
  - CSP headers for Figma plugin
- **Infrastructure**:
  - Docker Compose for local development
  - Turborepo monorepo structure
  - GitHub Actions CI/CD pipeline
  - Vercel deployment (frontend)
  - Railway deployment (backend, database, cache)
  - Automated database migrations
  - Redis caching layer

#### 🐛 Bug Fixes
- None (initial release)

#### 🔒 Security
- Implemented AES-256 encryption for AI provider API keys
- Added Clerk JWT verification middleware
- Implemented admin role guards on sensitive endpoints
- Added webhook signature verification (GitHub, Stripe)
- Implemented atomic credit deduction with database locks
- Added CORS origin validation
- Implemented CSP headers for Figma plugin sandbox

#### 📚 Documentation
- README.md with project overview
- Code standards guide (code-standards.md)
- System architecture document (system-architecture.md)
- Design guidelines (design-guidelines.md)
- Codebase summary (codebase-summary.md)
- Development roadmap (development-roadmap.md)
- Deployment guide (deployment-guide.md)
- Project changelog (this file)

#### 🧪 Testing
- 5 integration test suites
- 45+ test cases covering:
  - User management & authentication
  - Project CRUD operations
  - AI generation (single & multi-model)
  - Credit purchase & metering
  - GitHub sync workflows
  - Error handling & edge cases
  - Security checks (role guards, webhook verification)
- Jest test framework
- No external service mocks (real client tests)

#### 📊 Metrics
- **Codebase**: 210+ source files (TS/TSX)
- **Code Size**: 12,000+ lines of production code
- **Bundle Size**: Web ~180KB (gzip), Plugin ~142KB
- **Build Time**: ~30s (Turbo cache)
- **API Response**: <100ms (with cache)
- **Database**: 8 models, 6 enums, optimized indexes
- **Features**: 50+ user features, 20+ admin features

#### 🔄 Infrastructure
- **Frontend**: Vercel (Next.js 15, automatic scaling)
- **Backend**: Railway (NestJS, configurable pods)
- **Database**: PostgreSQL 16+ on Railway with daily backups
- **Cache**: Redis 7+ on Railway
- **CI/CD**: GitHub Actions (build, test, deploy)
- **Monitoring**: Vercel Analytics + Railway logs

#### 📦 Dependencies
- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui, Clerk, Stripe, TanStack Query
- **Backend**: NestJS, PostgreSQL, Prisma, Redis, Bull, Socket.IO, Stripe SDK, Anthropic SDK, OpenAI SDK
- **Plugin**: Preact, TypeScript, Figma Plugin API
- **Shared**: TypeScript, Zod, date-fns

#### 🎯 Success Criteria Met
- ✅ All 9 phases implemented (Phase 1-9)
- ✅ All PDR requirements completed
- ✅ 80%+ test coverage
- ✅ Production-ready security
- ✅ Complete documentation
- ✅ Deployment ready (Vercel + Railway)
- ✅ Multi-model AI support
- ✅ Bidirectional GitHub sync
- ✅ Prepaid credit billing system
- ✅ Admin panel with full controls

### Phase Breakdown

#### Phase 1: Project Setup & Foundation (Complete)
- Turborepo monorepo structure
- TypeScript strict mode
- Clerk authentication setup
- PostgreSQL + Prisma configuration
- Docker Compose for local dev
- Environment configuration

#### Phase 2: Database Schema & Models (Complete)
- 8 Prisma models
- 6 enums
- Performance indexes
- Migration files

#### Phase 3: Core API Structure & AI Generation (Complete)
- NestJS app with 6 modules
- Clerk JWT verification
- Multi-model AI support (Claude, GPT-4, Gemini)
- Bull queue for async jobs
- Credit metering

#### Phase 4: Billing System & Credit Management (Complete)
- Stripe integration
- Credit packages
- Purchase workflow
- Audit log (CreditLedger)
- Admin adjustments

#### Phase 5: Admin Panel & Model Management (Complete)
- Model registry CRUD
- Credit cost configuration
- Encrypted API keys
- Admin panel UI

#### Phase 6: GitHub Integration & Bidirectional Sync (Complete)
- Design-to-Code sync
- Code-to-Design sync
- PR creation
- Webhook handling

#### Phase 7: Figma Plugin Development (Complete)
- Preact UI (12 components)
- Design system editor
- AI generation interface
- Real-time updates

#### Phase 8: Web Dashboard & UI (Complete)
- Landing page
- Project management
- Billing interface
- Admin panel
- Responsive design

#### Phase 9: Testing, Security, & Polish (Complete)
- 45+ integration tests
- Security implementations
- Code quality
- Documentation
- Performance optimization

## Versioning

- **Current Version**: 1.0.0
- **Release Date**: 2026-03-19
- **Status**: Production Ready
- **Node Version**: 18.17+
- **Database**: PostgreSQL 16+

## Known Limitations

1. **Rate Limiting**: Not yet implemented (TODO: add rate-limiter package)
2. **Caching**: Redis used for models/sessions, could expand to more endpoints
3. **Scalability**: Backend single pod (can add more via Railway)
4. **Monitoring**: Basic logging (recommend Sentry for production errors)
5. **Analytics**: Basic dashboard (could add advanced analytics)

## Upgrade Guide

This is the initial v1.0.0 release. No upgrades from previous versions.

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/your-org/nexusui/issues
- Documentation: See ./docs/
- Deployments: Vercel & Railway dashboards
