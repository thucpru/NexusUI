/** Supported AI provider integrations */
export declare enum AIModelProvider {
    ANTHROPIC = "ANTHROPIC",
    OPENAI = "OPENAI",
    GOOGLE = "GOOGLE",
    MISTRAL = "MISTRAL",
    CUSTOM = "CUSTOM"
}
/** Availability status for an AI model */
export declare enum AIModelStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DEPRECATED = "DEPRECATED"
}
/** Configuration for how a model is called and priced */
export interface ModelConfig {
    /** Credits deducted per successful generation request */
    creditCostPerRequest: number;
    /** Max tokens / output length override (provider-specific) */
    maxOutputTokens?: number;
    /** Additional provider-specific options (temperature, top_p, etc.) */
    providerOptions?: Record<string, unknown>;
}
/** Admin-registered AI model entry */
export interface AIModel {
    id: string;
    name: string;
    /** Human-readable display label */
    displayName: string;
    provider: AIModelProvider;
    /** Exact model identifier sent to provider API (e.g., "claude-3-5-sonnet-20241022") */
    providerModelId: string;
    status: AIModelStatus;
    config: ModelConfig;
    /**
     * Reference key for looking up encrypted API key in the secrets store.
     * Actual key is NEVER returned to the client.
     */
    providerApiKeyRef: string;
    createdAt: Date;
    updatedAt: Date;
}
/** Slim model reference returned to non-admin clients */
export interface AIModelRef {
    id: string;
    displayName: string;
    provider: AIModelProvider;
    creditCostPerRequest: number;
    status: AIModelStatus;
}
//# sourceMappingURL=ai-model-types.d.ts.map