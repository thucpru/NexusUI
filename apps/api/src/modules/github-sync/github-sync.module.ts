/**
 * GitHubSyncModule — wires all GitHub sync services and controller.
 */
import { Module } from '@nestjs/common';
import { GitHubSyncController } from './github-sync.controller';
import { GitHubSyncService } from './github-sync.service';
import { GitHubAppAuthService } from './github-app-auth.service';
import { GitHubRepoReaderService } from './github-repo-reader.service';
import { GitHubBranchService } from './github-branch.service';
import { DesignToCodeSyncService } from './design-to-code-sync.service';
import { CodeToDesignSyncService } from './code-to-design-sync.service';
import { CodeGeneratorService } from './code-generator.service';
import { CodeParserService } from './code-parser.service';
import { ComponentTreeBuilderService } from './component-tree-builder.service';
import { ComponentToFigmaMapperService } from './component-to-figma-mapper.service';
import { GitHubWebhookHandlerService } from './github-webhook-handler.service';

@Module({
  controllers: [GitHubSyncController],
  providers: [
    GitHubSyncService,
    GitHubAppAuthService,
    GitHubRepoReaderService,
    GitHubBranchService,
    DesignToCodeSyncService,
    CodeToDesignSyncService,
    CodeGeneratorService,
    CodeParserService,
    ComponentTreeBuilderService,
    ComponentToFigmaMapperService,
    GitHubWebhookHandlerService,
  ],
  exports: [GitHubSyncService, GitHubBranchService, GitHubRepoReaderService, GitHubAppAuthService],
})
export class GitHubSyncModule {}
