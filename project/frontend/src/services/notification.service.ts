import { apiClient } from '../lib/api-client';

export class NotificationService {
  static async listNotifications(params?: any) {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  }

  static async getNotificationById(id: string) {
    const res = await apiClient.get(`/notifications/${id}`);
    return res.data;
  }

  static async markAsRead(id: string) {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  }

  static async markAllAsRead() {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  }

  static async deleteReadNotifications() {
    const res = await apiClient.delete('/notifications/read');
    return res.data;
  }

  static async getPreferences() {
    const res = await apiClient.get('/notifications/preferences');
    return res.data;
  }

  static async updatePreferences(data: any) {
    const res = await apiClient.patch('/notifications/preferences', data);
    return res.data;
  }
}
