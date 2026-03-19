/**
 * GenerationResponseDto — shape returned from generation endpoints.
 */
export interface GenerationResponseDto {
  id: string;
  projectId: string;
  userId: string;
  aiModelId: string;
  prompt: string;
  status: string;
  creditsCost: number;
  variantCount: number;
  framework: string;
  output: unknown | null;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
