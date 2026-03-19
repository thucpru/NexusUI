# NexusUI — Deployment Guide

**Last Updated**: 2026-03-19 | **Status**: Ready for Production

## Table of Contents
1. [Deployment Targets](#deployment-targets)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [Database Migrations](#database-migrations)
6. [Environment Configuration](#environment-configuration)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Logs](#monitoring--logs)
9. [Troubleshooting](#troubleshooting)

## Deployment Targets

### Frontend (Web Dashboard)
- **Platform**: Vercel
- **Framework**: Next.js 15
- **URL**: `https://nexusui.vercel.app` (or custom domain)
- **Regions**: Global CDN via Vercel Edge Network
- **Auto-scaling**: Automatic

### Backend (API Server)
- **Platform**: Railway
- **Framework**: NestJS
- **URL**: `https://api.nexusui.dev` (or Railway-provided URL)
- **Regions**: Configurable (default: US-East)
- **Scaling**: Manual pod increase via Railway console

### Database
- **Engine**: PostgreSQL 16
- **Hosting**: Railway
- **Backup**: Automatic daily backups (Railway)
- **Size**: Started at 500MB (scales as needed)

### Cache
- **Engine**: Redis 7
- **Hosting**: Railway
- **TTL**: Configurable (models: 1 hour, sessions: 24 hours)

## Prerequisites

### Required Tools
- **Node.js**: 18.17+ (use nvm for version management)
- **npm**: 10+
- **Git**: Latest version
- **Docker & Docker Compose**: For local development

### Required Accounts
- **GitHub**: For repository access and CI/CD
- **Vercel**: For frontend deployment
- **Railway**: For backend, database, and cache deployment
- **Clerk**: Authentication service (already configured in code)
- **Stripe**: Payment processing (already configured in code)
- **GitHub App**: OAuth integration (install via GitHub Settings)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/nexusui.git
cd nexusui
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy example to local .env
cp .env.example .env.local

# Edit with your local/dev credentials
nano .env.local
```

### 4. Start Docker Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services
docker-compose ps
```

### 5. Run Database Migrations
```bash
npm run db:migrate:dev
```

### 6. Start Development Servers
```bash
# Run all apps in development mode (Turbo)
npm run dev

# Or run individual apps:
npm run dev --filter=web
npm run dev --filter=api
```

### 7. Access Local Services
- **Web Dashboard**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

## Production Deployment

### Frontend Deployment (Vercel)

#### 1. Connect Repository to Vercel
```bash
# Via Vercel CLI
npm install -g vercel
vercel link
```

Or use Vercel dashboard:
1. Go to https://vercel.com/new
2. Select GitHub repository
3. Configure settings (see below)

#### 2. Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build --filter=web",
  "outputDirectory": "apps/web/.next",
  "env": [
    {
      "key": "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "value": "YOUR_CLERK_KEY"
    },
    {
      "key": "NEXT_PUBLIC_API_BASE_URL",
      "value": "https://api.nexusui.dev"
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

#### 3. Deploy
```bash
npm run build --filter=web
vercel deploy --prod
```

Or push to main branch (auto-deploys via GitHub integration).

#### 4. Verify Deployment
- Check Vercel dashboard for build status
- Test frontend at deployed URL
- Verify environment variables are set

### Backend Deployment (Railway)

#### 1. Connect Repository to Railway
1. Go to https://railway.app
2. New Project → GitHub → Select nexusui repository
3. Configure build settings

#### 2. Railway Configuration (railway.json)
```json
{
  "buildCommand": "npm run build --filter=api",
  "startCommand": "npm run start --filter=api",
  "port": 3001,
  "buildDir": "apps/api/dist"
}
```

#### 3. Set Environment Variables on Railway
Use Railway dashboard or CLI:
```bash
railway env set CLERK_SECRET_KEY=your_key
railway env set DATABASE_URL=postgresql://...
railway env set REDIS_URL=redis://...
railway env set STRIPE_SECRET_KEY=your_key
# ... etc
```

#### 4. Deploy
```bash
# Via Railway CLI
railway up

# Or push to main branch (auto-deploys)
git push origin main
```

#### 5. Verify Deployment
- Check Railway dashboard for deployment status
- Test API health: `curl https://api.nexusui.dev/health`
- Check logs: `railway logs`

### Database Migration (Railway PostgreSQL)

#### 1. Create PostgreSQL Plugin on Railway
- Railway Dashboard → New → Database → PostgreSQL
- Configure version (16+), storage (500MB starting)

#### 2. Get Connection String
```bash
# View DATABASE_URL in Railway dashboard
export DATABASE_URL="postgresql://user:pass@host:port/nexusui"
```

#### 3. Run Migrations
```bash
# From local machine or Railway CLI
npm run db:deploy

# Or via railway CLI
railway run npm run db:deploy
```

#### 4. Verify Schema
```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# List tables
\dt

# View users table
\d users
```

### Redis Setup (Railway)

#### 1. Create Redis Plugin on Railway
- Railway Dashboard → New → Database → Redis
- Configure version (7+)

#### 2. Get Connection String
```bash
# View REDIS_URL in Railway dashboard
export REDIS_URL="redis://:password@host:port"
```

#### 3. Test Connection
```bash
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

## Environment Configuration

### Backend Environment Variables (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/nexusui

# Cache
REDIS_URL=redis://localhost:6379

# Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_test_...

# GitHub
GITHUB_APP_ID=12345
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...
GITHUB_APP_WEBHOOK_SECRET=whsec_github_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_stripe_...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://nexusui.vercel.app

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-key
```

### Frontend Environment Variables (.env.local / Vercel)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_BASE_URL=https://api.nexusui.dev
NEXT_PUBLIC_APP_URL=https://nexusui.vercel.app
```

### Plugin Configuration
- Set in Figma plugin manifest.json
- Network domains: `api.nexusui.dev`, `nexusui.vercel.app`

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Build & Test (.github/workflows/ci.yml)
Runs on every push to main:
```yaml
- Install dependencies
- Run linting (ESLint)
- Run tests (Jest, Vitest)
- Build all packages
```

#### 2. Deploy to Staging (.github/workflows/deploy-staging.yml)
Runs on every push to develop:
```yaml
- Build frontend
- Deploy to Vercel preview
- Build backend
- Deploy to Railway staging
- Run migrations (staging DB)
```

#### 3. Deploy to Production (.github/workflows/deploy-prod.yml)
Runs on git tag (v*):
```yaml
- Build frontend (production)
- Deploy to Vercel production
- Build backend (production)
- Deploy to Railway production
- Run migrations (production DB)
- Smoke tests
```

#### 4. Security Scans (.github/workflows/security.yml)
Runs weekly:
```yaml
- Dependency vulnerabilities (npm audit)
- SAST scanning
- Secrets scanning
```

### Creating a Release
```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions automatically deploys to production
```

## Monitoring & Logs

### Vercel Analytics
- **Dashboard**: https://vercel.com/analytics
- **Metrics**: Page load, Core Web Vitals, traffic
- **Alerts**: Configurable performance thresholds

### Railway Logs
```bash
# View API logs
railway logs --service api

# View database logs
railway logs --service postgres

# Follow logs in real-time
railway logs --service api --follow
```

### Application Logs
- NestJS logger outputs to stdout
- Format: `[timestamp] [level] [context] message`
- Levels: log, error, warn, debug, verbose

### Database Monitoring
```bash
# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Monitor active connections
SELECT count(*) FROM pg_stat_activity;
```

### Error Tracking
- Integrate Sentry or similar for production errors
- Configure in API: `@Catch` filter sends errors
- Dashboard: https://sentry.io

## Troubleshooting

### Build Failures

#### "Cannot find module"
```bash
# Reinstall all dependencies
rm -rf node_modules
npm install

# Clear Turbo cache
npm run clean
npm install
```

#### "TypeScript compilation errors"
```bash
# Check strict TypeScript errors
npm run type-check

# Fix with ESLint auto-fix
npm run lint:fix
```

### Database Issues

#### "Connection refused"
```bash
# Check if database is running
docker-compose ps

# Restart services
docker-compose restart postgres redis

# Verify connection string
echo $DATABASE_URL
```

#### "Migration failed"
```bash
# Check migration status
npm run db:status

# Reset dev database (⚠️ deletes data)
npm run db:reset:dev

# Reapply migrations
npm run db:migrate:dev
```

### API Deployment Issues

#### "API timeout on Railway"
```bash
# Check if service is running
railway logs --service api

# Increase Railway pod size
railway env set RAILWAY_RAM=2048

# Redeploy
railway up
```

#### "CORS errors in browser"
```bash
# Verify CORS_ORIGIN env var matches frontend URL
railway env set CORS_ORIGIN=https://nexusui.vercel.app

# Restart API service
railway restart --service api
```

### Plugin Issues

#### "Plugin load fails in Figma"
1. Check manifest.json is valid JSON
2. Verify networkAccess.allowedDomains includes API URL
3. Check Figma plugin console (right-click → Plugin console)

#### "WebSocket connection fails"
1. Verify Socket.IO endpoint is correct
2. Check firewall allows WebSocket ports (443 for WSS)
3. Verify Redis is running (required for Socket.IO adapter)

### Performance

#### "API response slow"
```bash
# Check database query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE id = '...';

# Check Redis connection
redis-cli -u $REDIS_URL info stats
```

#### "Plugin bundle too large"
```bash
# Analyze bundle
npm run build:analyze --filter=plugin

# Optimize: Remove unused dependencies, code-split
```

## Rollback Procedure

### Frontend Rollback
```bash
# Via Vercel dashboard
1. Deployments → Select previous deployment
2. Click "..." → "Promote to Production"
```

### Backend Rollback
```bash
# Via Railway dashboard
1. Deployments → Select previous deployment
2. Click "Rollback"
```

## Security Checklist

- [ ] All environment variables set on production platforms
- [ ] CORS origins configured correctly
- [ ] HTTPS/SSL enabled (automatic on Vercel & Railway)
- [ ] Database backups enabled (Railway auto-backup daily)
- [ ] API key encryption verified (AES-256)
- [ ] Webhook signatures verified (GitHub, Stripe)
- [ ] Rate limiting configured (TODO: add rate-limiter package)
- [ ] Secrets not committed to git (check .gitignore)
- [ ] Database credentials not in code
- [ ] Admin routes guarded with role checks

## Scaling Considerations

### Vertical Scaling
- **Railway Pod Size**: Increase RAM/CPU for API service
- **PostgreSQL**: Increase storage/compute tier
- **Redis**: Increase memory allocation

### Horizontal Scaling
- **Frontend**: Automatic via Vercel CDN
- **Backend**: Add multiple Railway pods (requires load balancer)
- **Database**: Add read replicas (PostgreSQL)

### Load Testing
```bash
npm install -g artillery

artillery quick --count 100 --num 1000 https://api.nexusui.dev/health
```

## Maintenance

### Regular Tasks
- **Weekly**: Check logs for errors, monitor API performance
- **Monthly**: Review database size, optimize slow queries
- **Quarterly**: Security audit, dependency updates
- **Annually**: Capacity planning, architecture review

### Update Procedure
1. Test updates locally
2. Push to develop branch (triggers staging deploy)
3. Verify on staging environment
4. Create git tag v* to trigger production deployment
5. Monitor logs for 30 minutes post-deployment

## Documentation

For more details, see:
- [Code Standards](./code-standards.md) — Development practices
- [System Architecture](./system-architecture.md) — Component design
- [Codebase Summary](./codebase-summary.md) — File organization
