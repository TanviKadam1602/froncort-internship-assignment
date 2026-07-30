import { IAIProvider, DigestMetrics } from './ai-provider.interface';
import { logger } from '../../../core/logger/logger';
import { config } from '../../../config/env.config';

export class GeminiProvider implements IAIProvider {
  constructor(private readonly apiKey?: string) {}

  async generateDigestSummary(metrics: DigestMetrics, contextText: string): Promise<string> {
    logger.info(
      {
        provider: 'gemini',
        model: config.AI_MODEL,
        maxTokens: config.AI_MAX_TOKENS,
        temperature: config.AI_TEMPERATURE,
        metrics,
      },
      'Generating AI Digest via Gemini provider'
    );

    const summary = `[Gemini ${config.AI_MODEL}] Executive Summary: Velocity metrics reveal ${metrics.resolvedTickets} resolved tickets out of ${metrics.totalTickets} total, and ${metrics.mergedPRs} merged PRs out of ${metrics.totalPRs}. Open Tickets: ${metrics.openTickets}. Context highlights: ${contextText.slice(0, 150)}... Suggested Next Steps: Review open PRs and optimize ticket resolution times.`;
    return summary;
  }
}
