/**
 * UIRefactoringModule — wires all UI refactoring services, processors, and controller.
 *
 * Imports:
 *   - BullModule: registers the 'refactoring' queue
 *   - DatabaseModule: global provider (DatabaseService)
 *   - GitHubSyncModule: provides GitHubBranchService, GitHubRepoReaderService, GitHubAppAuthService
 *   - ModelRegistryModule: provides ModelRegistryService (model lookup + decryption)
 *   - BillingModule: provides CreditMeteringService
 */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UIRefactoringController } from './ui-refactoring-controller';
import { UIRefactoringService } from './ui-refactoring-service';
import { ComponentScannerService } from './component-scanner-service';
import { StyleExtractionService } from './style-extraction-service';
import { RefactorValidatorService } from './refactor-validator-service';
import { RefactoringProcessor } from './refactoring-processor';
import { RefactoringPrService } from './refactoring-pr-service';
import { AiProviderFactory } from '../ai-generation/providers/ai-provider-factory';
import { GitHubSyncModule } from '../github-sync/github-sync.module';
import { ModelRegistryModule } from '../model-registry/model-registry-module';
import { BillingModule } from '../billing/billing.module';
import { REFACTORING_QUEUE_NAME } from '@nexusui/shared';

@Module({
  imports: [
    // Register refactoring Bull queue
    BullModule.registerQueue({ name: REFACTORING_QUEUE_NAME }),

    // GitHub services: branch creation, repo reading, app auth
    GitHubSyncModule,

    // AI model registry: model lookup + API key decryption
    ModelRegistryModule,

    // Credit metering: deduct / refund credits
    BillingModule,
  ],
  controllers: [UIRefactoringController],
  providers: [
    UIRefactoringService,
    ComponentScannerService,
    StyleExtractionService,
    RefactorValidatorService,
    RefactoringProcessor,
    RefactoringPrService,
    // AiProviderFactory provided locally (stateless, no external deps)
    AiProviderFactory,
  ],
  exports: [UIRefactoringService],
})
export class UIRefactoringModule {}
