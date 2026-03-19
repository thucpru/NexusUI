/**
 * AiGenerationModule — wires up Bull queue, processor, service, and all
 * supporting services for multi-model AI generation.
 *
 * Imports ModelRegistryModule to access ModelRegistryService (model lookup + decryption).
 * Imports BillingModule to access CreditMeteringService (atomic credit deduction).
 * Imports RealtimeGateway via AppModule export for Socket.IO events.
 */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiGenerationController } from './ai-generation-controller';
import { AiGenerationService, GENERATION_QUEUE } from './ai-generation-service';
import { AiGenerationProcessor } from './ai-generation-processor';
import { AiProviderFactory } from './providers/ai-provider-factory';
import { PromptBuilderService } from './prompt-builder-service';
import { DesignSystemContextBuilder } from './design-system-context-builder';
import { OutputParserService } from './output-parser-service';
import { FigmaNodeConverterService } from './figma-node-converter-service';
import { ModelRegistryModule } from '../model-registry/model-registry-module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    // Register the generation queue
    BullModule.registerQueue({ name: GENERATION_QUEUE }),

    // Model registry for model CRUD + API key decryption
    // EncryptionService is exported by ModelRegistryModule — no duplicate needed here
    ModelRegistryModule,

    // Billing for atomic credit deduction/refund (CreditMeteringService)
    BillingModule,
  ],
  controllers: [AiGenerationController],
  providers: [
    AiGenerationService,
    AiGenerationProcessor,
    AiProviderFactory,
    PromptBuilderService,
    DesignSystemContextBuilder,
    OutputParserService,
    FigmaNodeConverterService,
    // EncryptionService removed: already exported by ModelRegistryModule (W4)
  ],
})
export class AiGenerationModule {}
