import { z } from 'zod';
import { AIModelProvider, AIModelStatus } from '../types/ai-model-types';
export declare const AIModelProviderSchema: z.ZodNativeEnum<typeof AIModelProvider>;
export declare const AIModelStatusSchema: z.ZodNativeEnum<typeof AIModelStatus>;
/** Schema for registering a new AI model (admin only) */
export declare const CreateAIModelSchema: z.ZodObject<{
    name: z.ZodString;
    displayName: z.ZodString;
    provider: z.ZodNativeEnum<typeof AIModelProvider>;
    providerModelId: z.ZodString;
    config: z.ZodObject<{
        creditCostPerRequest: z.ZodNumber;
        maxOutputTokens: z.ZodOptional<z.ZodNumber>;
        providerOptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        creditCostPerRequest: number;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    }, {
        creditCostPerRequest: number;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    }>;
    /**
     * Key reference used to retrieve the encrypted provider API key.
     * The actual key is never passed through this schema.
     */
    providerApiKeyRef: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    displayName: string;
    provider: AIModelProvider;
    providerModelId: string;
    config: {
        creditCostPerRequest: number;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    };
    providerApiKeyRef: string;
}, {
    name: string;
    displayName: string;
    provider: AIModelProvider;
    providerModelId: string;
    config: {
        creditCostPerRequest: number;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    };
    providerApiKeyRef: string;
}>;
/** Schema for updating a model's config or status (admin only) */
export declare const UpdateAIModelSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof AIModelStatus>>;
    config: z.ZodOptional<z.ZodObject<{
        creditCostPerRequest: z.ZodOptional<z.ZodNumber>;
        maxOutputTokens: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        providerOptions: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, "strip", z.ZodTypeAny, {
        creditCostPerRequest?: number | undefined;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    }, {
        creditCostPerRequest?: number | undefined;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    }>>;
    providerApiKeyRef: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: AIModelStatus | undefined;
    displayName?: string | undefined;
    config?: {
        creditCostPerRequest?: number | undefined;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    } | undefined;
    providerApiKeyRef?: string | undefined;
}, {
    status?: AIModelStatus | undefined;
    displayName?: string | undefined;
    config?: {
        creditCostPerRequest?: number | undefined;
        maxOutputTokens?: number | undefined;
        providerOptions?: Record<string, unknown> | undefined;
    } | undefined;
    providerApiKeyRef?: string | undefined;
}>;
export type CreateAIModelInput = z.infer<typeof CreateAIModelSchema>;
export type UpdateAIModelInput = z.infer<typeof UpdateAIModelSchema>;
//# sourceMappingURL=ai-model-validators.d.ts.map