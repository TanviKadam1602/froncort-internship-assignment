export interface DigestMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalPRs: number;
  approvedPRs: number;
  mergedPRs: number;
}

export interface IAIProvider {
  /**
   * Generates an executive progress digest summary based on metrics and context data.
   */
  generateDigestSummary(metrics: DigestMetrics, contextText: string): Promise<string>;
}
