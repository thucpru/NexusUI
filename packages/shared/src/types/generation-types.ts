/** States a generation job can be in */
export enum GenerationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/** Output of a completed generation */
export interface GenerationOutput {
  code: string;
  language: 'typescript' | 'javascript';
  framework: 'react' | 'vue' | 'svelte' | 'html';
  previewImageUrl?: string;
}

/** A single AI generation job */
export interface Generation {
  id: string;
  projectId: string;
  userId: string;
  /** References the AI model used (links to AIModel.id) */
  modelId: string;
  prompt: string;
  designSystemId?: string;
  status: GenerationStatus;
  creditsCost: number;
  output?: GenerationOutput;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/** Request payload to start a new generation */
export interface GenerationRequest {
  projectId: string;
  /** ID of the AI model to use for this generation */
  modelId: string;
  prompt: string;
  designSystemId?: string;
  framework?: 'react' | 'vue' | 'svelte' | 'html';
}
