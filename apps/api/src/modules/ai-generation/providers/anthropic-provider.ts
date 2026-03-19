/**
 * AnthropicProvider — adapter for Anthropic Claude models.
 * API key injected per-request (decrypted from DB) — not cached with key.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIResponse, GenerateOptions } from './ai-provider-interface';

const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider implements AIProvider {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(
    prompt: string,
    systemPrompt: string,
    options: GenerateOptions,
  ): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model: options.providerModelId,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const content = textBlock?.type === 'text' ? textBlock.text : '';

    return {
      content,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}
