-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "AIModelProvider" AS ENUM ('ANTHROPIC', 'OPENAI', 'GOOGLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CreditOperationType" AS ENUM ('PURCHASE', 'GENERATION_DEDUCT', 'GENERATION_REFUND', 'ADMIN_ADJUSTMENT', 'INITIAL_GRANT');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'SYNCING', 'ERROR');

-- CreateEnum
CREATE TYPE "RefactoringStatus" AS ENUM ('PENDING', 'SCANNING', 'ANALYZED', 'BEAUTIFYING', 'VALIDATING', 'PR_CREATED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "StyleIssueType" AS ENUM ('INCONSISTENT_SPACING', 'OUTDATED_CLASSES', 'MISSING_RESPONSIVE', 'POOR_CONTRAST', 'INLINE_STYLES', 'HARDCODED_COLORS', 'NO_DESIGN_TOKENS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "figmaFileId" TEXT,
    "figmaFileUrl" TEXT,
    "userId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_systems" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "colorTokens" JSONB NOT NULL DEFAULT '{}',
    "typographyTokens" JSONB NOT NULL DEFAULT '{}',
    "spacingTokens" JSONB NOT NULL DEFAULT '{}',
    "componentTokens" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "provider" "AIModelProvider" NOT NULL,
    "providerModelId" TEXT NOT NULL,
    "creditCostPerRequest" INTEGER NOT NULL,
    "providerApiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiModelId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "designSystemSnapshot" JSONB NOT NULL,
    "output" JSONB,
    "status" "GenerationStatus" NOT NULL DEFAULT 'QUEUED',
    "creditsCost" INTEGER NOT NULL,
    "variantCount" INTEGER NOT NULL DEFAULT 1,
    "framework" TEXT NOT NULL DEFAULT 'react',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operationType" "CreditOperationType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creditAmount" INTEGER NOT NULL,
    "bonusCredits" INTEGER NOT NULL DEFAULT 0,
    "priceInCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_connections" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "installationId" BIGINT NOT NULL,
    "repoOwner" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_audits" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "styleIssues" JSONB NOT NULL,
    "issueCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCredits" INTEGER NOT NULL DEFAULT 0,
    "logicSafety" TEXT NOT NULL DEFAULT 'SAFE',
    "lastScannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "component_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refactoring_jobs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "componentPath" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "status" "RefactoringStatus" NOT NULL DEFAULT 'PENDING',
    "beforeCode" TEXT,
    "afterCode" TEXT,
    "diffPreview" TEXT,
    "styleChanges" JSONB,
    "logicValidation" JSONB,
    "aiModelId" TEXT,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "githubPrUrl" TEXT,
    "githubBranch" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refactoring_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "design_systems_projectId_key" ON "design_systems"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_models_slug_key" ON "ai_models"("slug");

-- CreateIndex
CREATE INDEX "ai_models_isActive_idx" ON "ai_models"("isActive");

-- CreateIndex
CREATE INDEX "generations_projectId_createdAt_idx" ON "generations"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "generations_userId_idx" ON "generations"("userId");

-- CreateIndex
CREATE INDEX "credit_ledger_userId_createdAt_idx" ON "credit_ledger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_packages_isActive_idx" ON "credit_packages"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "github_connections_projectId_key" ON "github_connections"("projectId");

-- CreateIndex
CREATE INDEX "component_audits_projectId_idx" ON "component_audits"("projectId");

-- CreateIndex
CREATE INDEX "component_audits_projectId_issueCount_idx" ON "component_audits"("projectId", "issueCount");

-- CreateIndex
CREATE INDEX "refactoring_jobs_projectId_idx" ON "refactoring_jobs"("projectId");

-- CreateIndex
CREATE INDEX "refactoring_jobs_userId_idx" ON "refactoring_jobs"("userId");

-- CreateIndex
CREATE INDEX "refactoring_jobs_status_idx" ON "refactoring_jobs"("status");

-- CreateIndex
CREATE INDEX "refactoring_jobs_projectId_status_idx" ON "refactoring_jobs"("projectId", "status");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_systems" ADD CONSTRAINT "design_systems_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_aiModelId_fkey" FOREIGN KEY ("aiModelId") REFERENCES "ai_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_connections" ADD CONSTRAINT "github_connections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_audits" ADD CONSTRAINT "component_audits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refactoring_jobs" ADD CONSTRAINT "refactoring_jobs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refactoring_jobs" ADD CONSTRAINT "refactoring_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
