/**
 * AiProviderFactory — resolves the correct AI provider adapter from model config.
 * Provider clients are created per-request with decrypted API key (not cached).
 */
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { AIModelProvider } from '@nexusui/database';
import type { AIProvider } from './ai-provider-interface';
import { AnthropicProvider } from './anthropic-provider';
import { OpenAIProvider } from './openai-provider';

@Injectable()
export class AiProviderFactory {
  private readonly logger = new Logger(AiProviderFactory.name);

  /**
   * Return an AI provider adapter for the given provider type.
   * @param provider — AIModelProvider enum value from DB model
   * @param decryptedApiKey — plaintext API key (decrypted from DB)
   */
  getProvider(provider: AIModelProvider, decryptedApiKey: string): AIProvider {
    switch (provider) {
      case AIModelProvider.ANTHROPIC:
        this.logger.debug('Using AnthropicProvider');
        return new AnthropicProvider(decryptedApiKey);

      case AIModelProvider.OPENAI:
        this.logger.debug('Using OpenAIProvider');
        return new OpenAIProvider(decryptedApiKey);

      case AIModelProvider.GOOGLE:
      case AIModelProvider.CUSTOM:
        throw new NotImplementedException(
          `Provider "${provider}" is not yet supported`,
        );

      default:
        throw new NotImplementedException(`Unknown provider: ${provider as string}`);
    }
  }
}
