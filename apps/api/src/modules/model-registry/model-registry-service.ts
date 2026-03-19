/**
 * ModelRegistryService — CRUD for AI models.
 * Encrypts providerApiKey on write, exposes masked key in admin responses.
 * Decrypts key internally for generation use only — never returned to clients.
 */
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database-service';
import { EncryptionService } from '../ai-generation/encryption-service';
import type { CreateModelInput } from './dto/create-model-dto';
import type { UpdateModelInput } from './dto/update-model-dto';
import type { AIModel } from '@nexusui/database';

/** Public model shape returned to authenticated users — no API key */
export interface PublicModelView {
  id: string;
  slug: string;
  name: string;
  provider: string;
  creditCostPerRequest: number;
  description: string | null;
}

/** Admin model shape — masked API key, includes inactive models */
export interface AdminModelView extends PublicModelView {
  providerModelId: string;
  isActive: boolean;
  maskedApiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ModelRegistryService {
  private readonly logger = new Logger(ModelRegistryService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly encryption: EncryptionService,
  ) {}

  /** List active models for authenticated users — no API key exposed */
  async listActiveModels(): Promise<PublicModelView[]> {
    const models = await this.db.client.aIModel.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return models.map((m) => this.toPublicView(m));
  }

  /** List all models for admin — includes inactive, masked API key */
  async listAllModels(): Promise<AdminModelView[]> {
    const models = await this.db.client.aIModel.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return models.map((m) => this.toAdminView(m));
  }

  /** Create a model — encrypts API key before storage */
  async createModel(input: CreateModelInput): Promise<AdminModelView> {
    const existing = await this.db.client.aIModel.findUnique({
      where: { slug: input.slug },
    });
    if (existing) throw new ConflictException(`Slug "${input.slug}" already in use`);

    const encryptedKey = this.encryption.encrypt(input.providerApiKey);
    const model = await this.db.client.aIModel.create({
      data: {
        name: input.name,
        slug: input.slug,
        provider: input.provider,
        providerModelId: input.providerModelId,
        creditCostPerRequest: input.creditCostPerRequest,
        providerApiKey: encryptedKey,
        isActive: input.isActive ?? true,
        description: input.description ?? null,
      },
    });

    this.logger.log(`Model created: ${model.slug} (${model.provider})`);
    return this.toAdminView(model);
  }

  /** Update a model — re-encrypts API key if provided */
  async updateModel(id: string, input: UpdateModelInput): Promise<AdminModelView> {
    await this.findOrFail(id);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data['name'] = input.name;
    if (input.providerModelId !== undefined) data['providerModelId'] = input.providerModelId;
    if (input.creditCostPerRequest !== undefined) data['creditCostPerRequest'] = input.creditCostPerRequest;
    if (input.isActive !== undefined) data['isActive'] = input.isActive;
    if (input.description !== undefined) data['description'] = input.description;
    if (input.providerApiKey !== undefined) {
      data['providerApiKey'] = this.encryption.encrypt(input.providerApiKey);
    }

    const model = await this.db.client.aIModel.update({ where: { id }, data });
    return this.toAdminView(model);
  }

  /** Soft delete — sets isActive = false */
  async deactivateModel(id: string): Promise<AdminModelView> {
    await this.findOrFail(id);
    const model = await this.db.client.aIModel.update({
      where: { id },
      data: { isActive: false },
    });
    this.logger.log(`Model deactivated: ${model.slug}`);
    return this.toAdminView(model);
  }

  /**
   * Internal: fetch model with DECRYPTED API key.
   * ONLY used by generation processor — never exposed in HTTP responses.
   */
  async getModelWithDecryptedKey(id: string): Promise<AIModel & { decryptedApiKey: string }> {
    const model = await this.findOrFail(id);
    const decryptedApiKey = this.encryption.decrypt(model.providerApiKey);
    return { ...model, decryptedApiKey };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async findOrFail(id: string): Promise<AIModel> {
    const model = await this.db.client.aIModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException(`AI model not found: ${id}`);
    return model;
  }

  private toPublicView(m: AIModel): PublicModelView {
    return {
      id: m.id,
      slug: m.slug,
      name: m.name,
      provider: m.provider,
      creditCostPerRequest: m.creditCostPerRequest,
      description: m.description,
    };
  }

  private toAdminView(m: AIModel): AdminModelView {
    return {
      ...this.toPublicView(m),
      providerModelId: m.providerModelId,
      isActive: m.isActive,
      maskedApiKey: this.encryption.maskKey(this.tryDecrypt(m.providerApiKey)),
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  /** Safe decrypt for masking — returns placeholder on failure */
  private tryDecrypt(encrypted: string): string {
    try {
      return this.encryption.decrypt(encrypted);
    } catch {
      return '???';
    }
  }
}
