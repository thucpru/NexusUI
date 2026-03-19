/**
 * OpenAIProvider — adapter for OpenAI GPT models.
 * API key injected per-request (decrypted from DB) — not cached with key.
 */
import OpenAI from 'openai';
import type { AIProvider, AIResponse, GenerateOptions } from './ai-provider-interface';

const DEFAULT_MAX_TOKENS = 4096;

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(
    prompt: string,
    systemPrompt: string,
    options: GenerateOptions,
  ): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: options.providerModelId,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const choice = response.choices[0];
    const content = choice?.message?.content ?? '';
    const usage = response.usage;

    return {
      content,
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
    };
  }
}
