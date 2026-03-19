# NexusUI — Code Standards

## Language & Framework
- **Language**: TypeScript (strict mode) across all packages
- **Frontend**: Next.js 15 (App Router, RSC)
- **Backend**: NestJS (decorators, DI, modules)
- **Plugin**: TypeScript + Preact (Figma Plugin API)
- **Database**: PostgreSQL + Prisma ORM
- **Monorepo**: Turborepo

## Project Structure (Turborepo Monorepo)

```
nexusui/
├── apps/
│   ├── web/                    # Next.js dashboard
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── lib/            # Utilities, hooks
│   │   │   └── styles/         # Global styles
│   │   └── ...
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules
│   │   │   ├── common/         # Shared guards, pipes
│   │   │   └── config/         # App configuration
│   │   └── ...
│   └── plugin/                 # Figma plugin
│       ├── src/
│       │   ├── ui/             # Plugin UI (Preact)
│       │   ├── code/           # Plugin logic (sandbox)
│       │   └── types/          # Plugin-specific types
│       └── ...
├── packages/
│   ├── shared/                 # Shared types, utils
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── constants/      # Shared constants
│   │   │   └── validators/     # Zod schemas
│   │   └── ...
│   ├── database/               # Prisma schema + client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   └── ui/                     # Shared UI components
│       └── src/
├── docs/                       # Project documentation
├── plans/                      # Implementation plans
├── turbo.json                  # Turborepo config
├── package.json                # Root workspace
└── .env.example                # Environment variables
```

## Naming Conventions
- **Files**: kebab-case (`design-token-service.ts`)
- **Classes**: PascalCase (`DesignTokenService`)
- **Functions**: camelCase (`getDesignTokens`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TOKEN_LIMIT`)
- **Types/Interfaces**: PascalCase with `I` prefix optional (`DesignToken` or `IDesignToken`)
- **Database tables**: snake_case (`design_systems`)
- **API endpoints**: kebab-case (`/api/design-tokens`)

## File Size Limits
- Max 200 lines per code file
- Split large files into focused modules
- Extract utility functions to separate files
- Use composition over inheritance

## Code Quality
- ESLint + Prettier for formatting
- Strict TypeScript (`strict: true`)
- Zod for runtime validation
- Try-catch error handling with typed errors
- Meaningful variable/function names (self-documenting)

## API Standards
- RESTful endpoints with consistent response format
- JWT auth via Clerk middleware
- Request validation with Zod + class-validator (NestJS)
- Error responses: `{ error: string, code: string, details?: any }`
- Pagination: cursor-based for lists

## Testing
- Unit tests: Vitest (shared, utils)
- Integration tests: Jest (NestJS modules)
- E2E tests: Playwright (web dashboard)
- Test coverage target: 80%+
- No mocks for external services in integration tests

## Git Conventions
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Branch naming: `feat/feature-name`, `fix/bug-description`
- PRs require review before merge
- No direct pushes to `main`
