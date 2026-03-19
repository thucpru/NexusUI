import { z } from 'zod';
import { GenerationStatus } from '../types/generation-types';

export const GenerationStatusSchema = z.nativeEnum(GenerationStatus);

const FrameworkSchema = z.enum(['react', 'vue', 'svelte', 'html']);

export const CreateGenerationSchema = z.object({
  projectId: z.string().uuid(),
  /** ID of the AI model to use — must reference an active AIModel record */
  modelId: z.string().uuid(),
  prompt: z.string().min(10).max(2000),
  designSystemId: z.string().uuid().optional(),
  framework: FrameworkSchema.optional().default('react'),
});

export const GenerationQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: GenerationStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type CreateGenerationInput = z.infer<typeof CreateGenerationSchema>;
export type GenerationQueryInput = z.infer<typeof GenerationQuerySchema>;
