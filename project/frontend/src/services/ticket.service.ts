import { apiClient } from '../lib/api-client';

export class TicketService {
  static async listTickets(params?: any) {
    const res = await apiClient.get('/tickets', { params });
    return res.data;
  }

  static async getTicketById(id: string) {
    const res = await apiClient.get(`/tickets/${id}`);
    return res.data;
  }

  static async createTicket(data: any) {
    const res = await apiClient.post('/tickets', data);
    return res.data;
  }

  static async updateTicket(id: string, data: any) {
    const res = await apiClient.patch(`/tickets/${id}`, data);
    return res.data;
  }

  static async addComment(ticketId: string, content: string) {
    const res = await apiClient.post(`/tickets/${ticketId}/comments`, { content });
    return res.data;
  }
}
