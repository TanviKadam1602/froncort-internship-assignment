import { apiClient } from '../lib/api-client';

export class AIService {
  static async generateDigest(intervalType = 'DAILY') {
    const res = await apiClient.post('/ai/digest', { intervalType });
    return res.data;
  }

  static async listDigests(params?: any) {
    const res = await apiClient.get('/ai/digest', { params });
    return res.data;
  }

  static async getDigestById(id: string) {
    const res = await apiClient.get(`/ai/digest/${id}`);
    return res.data;
  }
}
