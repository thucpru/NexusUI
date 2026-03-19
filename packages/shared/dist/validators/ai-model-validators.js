import { z } from 'zod';
import { AIModelProvider, AIModelStatus } from '../types/ai-model-types';
export const AIModelProviderSchema = z.nativeEnum(AIModelProvider);
export const AIModelStatusSchema = z.nativeEnum(AIModelStatus);
const ModelConfigSchema = z.object({
    creditCostPerRequest: z.number().int().positive(),
    maxOutputTokens: z.number().int().positive().optional(),
    providerOptions: z.record(z.unknown()).optional(),
});
/** Schema for registering a new AI model (admin only) */
export const CreateAIModelSchema = z.object({
    name: z.string().min(1).max(100),
    displayName: z.string().min(1).max(100),
    provider: AIModelProviderSchema,
    providerModelId: z.string().min(1),
    config: ModelConfigSchema,
    /**
     * Key reference used to retrieve the encrypted provider API key.
     * The actual key is never passed through this schema.
     */
    providerApiKeyRef: z.string().min(1),
});
/** Schema for updating a model's config or status (admin only) */
export const UpdateAIModelSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    status: AIModelStatusSchema.optional(),
    config: ModelConfigSchema.partial().optional(),
    providerApiKeyRef: z.string().min(1).optional(),
});
//# sourceMappingURL=ai-model-validators.js.map