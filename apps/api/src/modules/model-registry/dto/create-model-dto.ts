/**
 * CreateModelDto — validated input for creating an AI model.
 * API key is encrypted before DB storage; never returned in responses.
 */
import { z } from 'zod';
import { AIModelProvider } from '@nexusui/database';

export const CreateModelSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  provider: z.nativeEnum(AIModelProvider),
  providerModelId: z.string().min(1).max(200),
  creditCostPerRequest: z.number().int().positive(),
  providerApiKey: z.string().min(1),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

export type CreateModelInput = z.infer<typeof CreateModelSchema>;
