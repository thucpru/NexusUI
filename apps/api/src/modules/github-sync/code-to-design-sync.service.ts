/**
 * CodeToDesignSyncService — reads a repo, parses JSX/CSS, and returns:
 *   1. Component tree JSON (Figma-renderable nodes)
 *   2. Extracted design tokens (for design system update)
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import { GitHubRepoReaderService } from './github-repo-reader.service';
import { CodeParserService } from './code-parser.service';
import { ComponentTreeBuilderService } from './component-tree-builder.service';
import { ComponentToFigmaMapperService } from './component-to-figma-mapper.service';
import type { CodeToDesignResult, ExtractedDesignTokens } from './dto/sync-status-dto';

@Injectable()
export class CodeToDesignSyncService {
  private readonly logger = new Logger(CodeToDesignSyncService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly repoReader: GitHubRepoReaderService,
    private readonly codeParser: CodeParserService,
    private readonly treeBuilder: ComponentTreeBuilderService,
    private readonly figmaMapper: ComponentToFigmaMapperService,
  ) {}

  async sync(projectId: string): Promise<CodeToDesignResult> {
    const connection = await this.db.client.gitHubConnection.findUnique({
      where: { projectId },
    });
    if (!connection) throw new NotFoundException(`No GitHub connection for project ${projectId}`);

    await this.db.client.gitHubConnection.update({
      where: { projectId },
      data: { syncStatus: 'SYNCING' },
    });

    try {
      const installationId = Number(connection.installationId);
      const owner = connection.repoOwner;
      const repo = connection.repoName;
      const branch = connection.branch;

      // 1. Read file tree (filtered to .tsx, .jsx, .css, .scss, .json)
      const fileList = await this.repoReader.getFileTree(installationId, owner, repo, branch);

      // 2. Read contents (first 50 files to stay within API limits for MVP)
      const filesToRead = fileList.slice(0, 50).map((f) => f.path);
      const files = await this.repoReader.getFileContents(installationId, owner, repo, filesToRead);

      // 3. Parse AST → components + tokens
      const { components, tokens } = this.codeParser.parseFiles(files);
      this.logger.debug(`Parsed ${components.length} components from ${files.length} files`);

      // 4. Build component tree
      const componentRoots = this.treeBuilder.buildTrees(files);

      // 5. Map to Figma nodes
      const figmaNodes = this.figmaMapper.mapComponentTrees(componentRoots);

      // 6. Build design token response
      const designTokens: ExtractedDesignTokens = {
        colors: Object.fromEntries([...tokens.colors].map((c, i) => [`color-${i + 1}`, c])),
        typography: Object.fromEntries(
          [...tokens.fontSizes].map((s, i) => [`text-${i + 1}`, { fontSize: s }]),
        ),
        spacing: Object.fromEntries([...tokens.spacing].map((s, i) => [`space-${i + 1}`, s])),
      };

      // 7. Persist sync timestamp
      await this.db.client.gitHubConnection.update({
        where: { projectId },
        data: { syncStatus: 'IDLE', lastSyncAt: new Date() },
      });

      return {
        componentTree: figmaNodes,
        designTokens,
        filesScanned: files.length,
      };
    } catch (err) {
      await this.db.client.gitHubConnection.update({
        where: { projectId },
        data: { syncStatus: 'ERROR' },
      });
      throw err;
    }
  }
}
