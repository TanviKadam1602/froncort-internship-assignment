import { IAIProvider } from './ai-provider.interface';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { config } from '../../../config/env.config';

export class AIProviderFactory {
  /**
   * Factory method returning the configured IAIProvider instance based on AI_PROVIDER env variable.
   */
  static getProvider(): IAIProvider {
    const providerName = (config.AI_PROVIDER || 'gemini').toLowerCase();

    if (providerName === 'openai') {
      return new OpenAIProvider(config.OPENAI_API_KEY);
    }

    return new GeminiProvider(config.GEMINI_API_KEY);
  }
}
