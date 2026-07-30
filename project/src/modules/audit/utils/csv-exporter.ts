export class CSVExporter {
  /**
   * Formats audit log entries into CSV string format.
   */
  static generateCSV(records: any[]): string {
    const headers = ['Timestamp', 'Actor Email', 'Actor ID', 'Module', 'Action', 'Resource Type', 'Resource ID', 'Organization ID'];
    const rows = records.map((r) => [
      `"${new Date(r.timestamp).toISOString()}"`,
      `"${r.actorEmail || r.actor?.email || ''}"`,
      `"${r.actorId}"`,
      `"${r.module || 'SYSTEM'}"`,
      `"${r.actionType}"`,
      `"${r.resourceType}"`,
      `"${r.resourceId}"`,
      `"${r.orgId}"`,
    ]);

    const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))];
    return csvLines.join('\n');
  }
}
