import { z } from 'zod';

/** Validates payload for triggering a component scan */
export const scanComponentsSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  branch: z.string().optional(),
  paths: z.array(z.string()).optional(),
});

/** Validates payload for beautifying a single component */
export const beautifyComponentSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  componentPath: z.string().min(1, 'Component path is required'),
  aiModelId: z.string().min(1, 'AI model ID is required'),
  designSystemId: z.string().optional(),
});

/** Validates payload for generating a GitHub PR from completed jobs */
export const generatePrSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  jobIds: z.array(z.string().min(1)).min(1, 'At least one job ID required'),
  branchName: z.string().optional(),
});

/** Validates query params for listing refactoring jobs */
export const refactoringJobQuerySchema = z.object({
  status: z
    .enum([
      'PENDING',
      'SCANNING',
      'ANALYZED',
      'BEAUTIFYING',
      'VALIDATING',
      'PR_CREATED',
      'COMPLETED',
      'FAILED',
    ])
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type ScanComponentsInput = z.infer<typeof scanComponentsSchema>;
export type BeautifyComponentInput = z.infer<typeof beautifyComponentSchema>;
export type GeneratePrInput = z.infer<typeof generatePrSchema>;
export type RefactoringJobQueryInput = z.infer<typeof refactoringJobQuerySchema>;
