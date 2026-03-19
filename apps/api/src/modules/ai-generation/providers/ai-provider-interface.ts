/**
 * AI provider interface — common contract for all AI provider adapters.
 * Each adapter receives the decrypted API key at instantiation.
 */

/** Options passed to the provider's generate call */
export interface GenerateOptions {
  /** Exact model identifier per provider (e.g. "claude-3-5-sonnet-20241022") */
  providerModelId: string;
  /** Maximum output tokens — provider-specific default if omitted */
  maxTokens?: number;
  /** Sampling temperature 0–1 */
  temperature?: number;
}

/** Normalized response from any AI provider */
export interface AIResponse {
  /** Raw text content returned by the provider */
  content: string;
  /** Input tokens consumed (for logging) */
  inputTokens: number;
  /** Output tokens consumed (for logging) */
  outputTokens: number;
}

/** Contract all provider adapters must implement */
export interface AIProvider {
  generate(
    prompt: string,
    systemPrompt: string,
    options: GenerateOptions,
  ): Promise<AIResponse>;
}
