import { DigestMetrics } from '../providers/ai-provider.interface';

export class DigestPromptTemplate {
  /**
   * Builds dynamic prompt text for executive AI progress digests.
   */
  static buildPrompt(metrics: DigestMetrics, contextText: string): string {
    return `
You are an AI Executive Progress Analyst for a multi-tenant enterprise software workspace.
Summarize organization activity and key productivity insights based on the following empirical metrics:

--- METRICS SNAPSHOT ---
- Total Tickets: ${metrics.totalTickets}
- Open Tickets: ${metrics.openTickets}
- Resolved Tickets: ${metrics.resolvedTickets}
- Total Pull Requests: ${metrics.totalPRs}
- Approved Pull Requests: ${metrics.approvedPRs}
- Merged Pull Requests: ${metrics.mergedPRs}

--- ACTIVITY CONTEXT ---
${contextText}

--- INSTRUCTIONS ---
Generate a concise, professional executive summary containing:
1. Overall Progress
2. Ticket Resolution & PR Activity
3. Critical Issues & Bottlenecks
4. Suggested Next Steps
`.trim();
  }
}
