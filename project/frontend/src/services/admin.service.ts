import { apiClient } from '../lib/api-client';

export class AdminService {
  static async getPlatformStats() {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  }

  static async listUsers(params?: any) {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  }

  static async listOrganizations(params?: any) {
    const res = await apiClient.get('/admin/organizations', { params });
    return res.data;
  }

  static async listFeatureFlags() {
    const res = await apiClient.get('/admin/feature-flags');
    return res.data;
  }

  static async toggleFeatureFlag(flagKey: string, enabled: boolean) {
    const res = await apiClient.patch(`/admin/feature-flags/${flagKey}`, { enabled });
    return res.data;
  }
}
