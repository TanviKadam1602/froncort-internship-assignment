import { apiClient } from '../lib/api-client';

export class AuthService {
  static async login(data: { email: string; password: string; orgSlug?: string }) {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  }

  static async register(data: { email: string; password: string; fullName: string; orgName: string; orgSlug: string }) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  }

  static async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  }

  static async switchOrg(targetOrgId: string) {
    const res = await apiClient.post('/auth/switch-org', { targetOrgId });
    return res.data;
  }

  static async logout() {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  }

  static async logoutAll() {
    const res = await apiClient.post('/auth/logout-all');
    return res.data;
  }
}
