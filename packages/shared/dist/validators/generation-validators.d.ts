import { z } from 'zod';
import { GenerationStatus } from '../types/generation-types';
export declare const GenerationStatusSchema: z.ZodNativeEnum<typeof GenerationStatus>;
export declare const CreateGenerationSchema: z.ZodObject<{
    projectId: z.ZodString;
    /** ID of the AI model to use — must reference an active AIModel record */
    modelId: z.ZodString;
    prompt: z.ZodString;
    designSystemId: z.ZodOptional<z.ZodString>;
    framework: z.ZodDefault<z.ZodOptional<z.ZodEnum<["react", "vue", "svelte", "html"]>>>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    modelId: string;
    prompt: string;
    framework: "react" | "vue" | "svelte" | "html";
    designSystemId?: string | undefined;
}, {
    projectId: string;
    modelId: string;
    prompt: string;
    designSystemId?: string | undefined;
    framework?: "react" | "vue" | "svelte" | "html" | undefined;
}>;
export declare const GenerationQuerySchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof GenerationStatus>>;
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: GenerationStatus | undefined;
    projectId?: string | undefined;
    cursor?: string | undefined;
}, {
    status?: GenerationStatus | undefined;
    projectId?: string | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
}>;
export type CreateGenerationInput = z.infer<typeof CreateGenerationSchema>;
export type GenerationQueryInput = z.infer<typeof GenerationQuerySchema>;
//# sourceMappingURL=generation-validators.d.ts.map