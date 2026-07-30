import { apiClient } from '../lib/api-client';

export class CollaborationService {
  static async listConnections() {
    const res = await apiClient.get('/collaboration/connections');
    return res.data;
  }

  static async requestConnection(targetOrgSlug: string) {
    const res = await apiClient.post('/collaboration/connections', { targetOrgSlug });
    return res.data;
  }

  static async acceptConnection(id: string) {
    const res = await apiClient.patch(`/collaboration/connections/${id}/accept`);
    return res.data;
  }

  static async listSharedResources() {
    const res = await apiClient.get('/collaboration/resources');
    return res.data;
  }

  static async shareResource(data: { targetOrgId: string; resourceType: string; resourceId: string; permission?: string }) {
    const res = await apiClient.post('/collaboration/resources', data);
    return res.data;
  }
}
