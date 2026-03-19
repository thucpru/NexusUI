/**
 * UpdateModelDto — validated input for updating an AI model.
 * All fields optional. providerApiKey re-encrypted on change.
 */
import { z } from 'zod';

export const UpdateModelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  providerModelId: z.string().min(1).max(200).optional(),
  creditCostPerRequest: z.number().int().positive().optional(),
  providerApiKey: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(500).optional(),
});

export type UpdateModelInput = z.infer<typeof UpdateModelSchema>;
