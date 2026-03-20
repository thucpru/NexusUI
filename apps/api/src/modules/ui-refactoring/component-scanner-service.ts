/**
 * ComponentScannerService — scans a GitHub repo for React components,
 * detects style issues, and persists ComponentAudit records to the DB.
 */
import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import { GitHubRepoReaderService } from '../github-sync/github-repo-reader.service';
import { StyleExtractionService } from './style-extraction-service';
import { REFACTORING_DEFAULTS } from '@nexusui/shared';
import type { ComponentAuditDto, ComponentAuditListResponse } from '@nexusui/shared';

/** Extract component name from file path (e.g. src/Button.tsx → Button) */
function componentNameFromPath(filePath: string): string {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1] ?? filePath;
  return filename.replace(/\.(tsx|jsx)$/, '');
}

/** Estimate credit cost based on issue count */
function estimateCredits(issueCount: number): number {
  return Math.max(REFACTORING_DEFAULTS.DEFAULT_CREDITS_PER_COMPONENT, issueCount * 2);
}

@Injectable()
export class ComponentScannerService {
  private readonly logger = new Logger(ComponentScannerService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly repoReader: GitHubRepoReaderService,
    private readonly styleExtractor: StyleExtractionService,
  ) {}

  /**
   * Scan a GitHub repo for React components.
   * Fetches .tsx/.jsx files, analyzes each for style issues, upserts ComponentAudit records.
   */
  async scanRepository(
    projectId: string,
    userId: string,
    branch?: string,
    paths?: string[],
  ): Promise<ComponentAuditListResponse> {
    // Verify project ownership and get GitHub connection
    const project = await this.db.client.project.findFirst({
      where: { id: projectId, userId },
      include: { githubConnection: true },
    });
    if (!project) throw new ForbiddenException('Project not found or access denied');
    if (!project.githubConnection) throw new NotFoundException('No GitHub connection for this project');

    const conn = project.githubConnection;
    const scanBranch = branch ?? conn.branch;
    const installationId = Number(conn.installationId);

    // Get file tree and filter for component files
    const allFiles = await this.repoReader.getFileTree(installationId, conn.repoOwner, conn.repoName, scanBranch);
    const componentFiles = allFiles
      .filter((f) => (f.path.endsWith('.tsx') || f.path.endsWith('.jsx')))
      .filter((f) => !paths || paths.some((p) => f.path.startsWith(p)))
      .slice(0, REFACTORING_DEFAULTS.MAX_COMPONENTS_PER_SCAN);

    this.logger.log(`Scanning ${componentFiles.length} component files in project ${projectId}`);

    // Read all files in batches
    const filePaths = componentFiles.map((f) => f.path);
    const fileContents = await this.repoReader.getFileContents(
      installationId,
      conn.repoOwner,
      conn.repoName,
      filePaths,
    );

    // Process each file and upsert audit records
    const auditDtos: ComponentAuditDto[] = [];
    for (const file of fileContents) {
      try {
        const { stylingNodes, safetyLevel } = this.styleExtractor.extractStyling(file.content);
        const styleIssues = this.styleExtractor.detectStyleIssues(file.content);
        const issueCount = styleIssues.length;
        const estimatedCredits = estimateCredits(issueCount);
        const componentName = componentNameFromPath(file.path);

        // Upsert: update existing or create new audit record
        const audit = await this.db.client.componentAudit.upsert({
          where: { projectId_filePath: { projectId, filePath: file.path } } as never,
          create: {
            projectId,
            filePath: file.path,
            componentName,
            styleIssues: styleIssues as never,
            issueCount,
            estimatedCredits,
            logicSafety: safetyLevel,
            lastScannedAt: new Date(),
          },
          update: {
            componentName,
            styleIssues: styleIssues as never,
            issueCount,
            estimatedCredits,
            logicSafety: safetyLevel,
            lastScannedAt: new Date(),
          },
        });

        // Suppress unused variable warning
        void stylingNodes;

        auditDtos.push({
          id: audit.id,
          filePath: audit.filePath,
          componentName: audit.componentName,
          styleIssues,
          issueCount: audit.issueCount,
          estimatedCredits: audit.estimatedCredits,
          logicSafety: audit.logicSafety as 'SAFE' | 'RISKY' | 'MANUAL_REVIEW',
          lastScannedAt: audit.lastScannedAt.toISOString(),
        });
      } catch (err) {
        this.logger.warn(`Failed to scan ${file.path}: ${(err as Error).message}`);
      }
    }

    const totalIssues = auditDtos.reduce((sum, a) => sum + a.issueCount, 0);
    this.logger.log(`Scan complete: ${auditDtos.length} components, ${totalIssues} total issues`);

    return { components: auditDtos, totalIssues, totalComponents: auditDtos.length };
  }

  /** List all ComponentAudit records for a project */
  async getComponentAudits(projectId: string): Promise<ComponentAuditListResponse> {
    const audits = await this.db.client.componentAudit.findMany({
      where: { projectId },
      orderBy: { issueCount: 'desc' },
    });

    const components: ComponentAuditDto[] = audits.map((a) => ({
      id: a.id,
      filePath: a.filePath,
      componentName: a.componentName,
      styleIssues: a.styleIssues as never,
      issueCount: a.issueCount,
      estimatedCredits: a.estimatedCredits,
      logicSafety: a.logicSafety as 'SAFE' | 'RISKY' | 'MANUAL_REVIEW',
      lastScannedAt: a.lastScannedAt.toISOString(),
    }));

    return {
      components,
      totalIssues: components.reduce((sum, c) => sum + c.issueCount, 0),
      totalComponents: components.length,
    };
  }

  /** Fetch a single ComponentAudit by ID */
  async getComponentAudit(id: string): Promise<ComponentAuditDto> {
    const audit = await this.db.client.componentAudit.findUnique({ where: { id } });
    if (!audit) throw new NotFoundException(`Component audit ${id} not found`);

    return {
      id: audit.id,
      filePath: audit.filePath,
      componentName: audit.componentName,
      styleIssues: audit.styleIssues as never,
      issueCount: audit.issueCount,
      estimatedCredits: audit.estimatedCredits,
      logicSafety: audit.logicSafety as 'SAFE' | 'RISKY' | 'MANUAL_REVIEW',
      lastScannedAt: audit.lastScannedAt.toISOString(),
    };
  }
}
