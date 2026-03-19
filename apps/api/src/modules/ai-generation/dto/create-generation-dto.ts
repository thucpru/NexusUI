/**
 * CreateGenerationDto — validated input to start a new generation job.
 */
import { z } from 'zod';

export const CreateGenerationSchema = z.object({
  projectId: z.string().min(1),
  modelId: z.string().min(1),
  prompt: z.string().min(1).max(2000),
  variantCount: z.number().int().min(1).max(5).default(1),
  framework: z.enum(['react', 'vue', 'svelte', 'html']).default('react'),
});

export type CreateGenerationInput = z.infer<typeof CreateGenerationSchema>;
