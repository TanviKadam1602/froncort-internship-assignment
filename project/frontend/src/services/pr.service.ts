import { apiClient } from '../lib/api-client';

export class PRService {
  static async listPRs(params?: any) {
    const res = await apiClient.get('/prs', { params });
    return res.data;
  }

  static async getPRById(id: string) {
    const res = await apiClient.get(`/prs/${id}`);
    return res.data;
  }

  static async getPRDiff(id: string, compareVersion?: number) {
    const res = await apiClient.get(`/prs/${id}/diff`, { params: { compareVersion } });
    return res.data;
  }

  static async approvePR(id: string, comment?: string) {
    const res = await apiClient.post(`/prs/${id}/approve`, { comment });
    return res.data;
  }

  static async mergePR(id: string) {
    const res = await apiClient.post(`/prs/${id}/merge`);
    return res.data;
  }
}
