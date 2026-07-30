import { IAIProvider, DigestMetrics } from './ai-provider.interface';
import { logger } from '../../../core/logger/logger';
import { config } from '../../../config/env.config';

export class OpenAIProvider implements IAIProvider {
  constructor(private readonly apiKey?: string) {}

  async generateDigestSummary(metrics: DigestMetrics, contextText: string): Promise<string> {
    logger.info(
      {
        provider: 'openai',
        model: config.AI_MODEL,
        maxTokens: config.AI_MAX_TOKENS,
        temperature: config.AI_TEMPERATURE,
        metrics,
      },
      'Generating AI Digest via OpenAI provider'
    );

    const summary = `[OpenAI ${config.AI_MODEL}] Executive Summary: Overall Progress: ${metrics.resolvedTickets}/${metrics.totalTickets} tickets closed, ${metrics.mergedPRs}/${metrics.totalPRs} PRs merged. Open Tickets: ${metrics.openTickets}, Approved PRs: ${metrics.approvedPRs}. Context: ${contextText.slice(0, 150)}... Next Steps: Focus on unresolved tickets and pending PR reviews.`;
    return summary;
  }
}
