import { apiClient } from '../lib/api-client';

export class AuditService {
  static async listAuditLogs(params?: any) {
    const res = await apiClient.get('/audit', { params });
    return res.data;
  }

  static async getAuditTimeline(params?: any) {
    const res = await apiClient.get('/audit/timeline', { params });
    return res.data;
  }

  static async verifyHashChain() {
    const res = await apiClient.get('/audit/verify');
    return res.data;
  }

  static async exportCSV(params?: any) {
    const res = await apiClient.get('/audit/export', {
      params,
      responseType: 'blob',
    });
    return res.data;
  }
}
