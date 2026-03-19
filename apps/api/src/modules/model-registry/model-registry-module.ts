/**
 * ModelRegistryModule — admin CRUD for AI models, user listing of active models.
 * Exports ModelRegistryService for use by AiGenerationModule.
 */
import { Module } from '@nestjs/common';
import { ModelRegistryController } from './model-registry-controller';
import { ModelRegistryService } from './model-registry-service';
import { EncryptionService } from '../ai-generation/encryption-service';

@Module({
  controllers: [ModelRegistryController],
  providers: [ModelRegistryService, EncryptionService],
  exports: [ModelRegistryService, EncryptionService],
})
export class ModelRegistryModule {}
