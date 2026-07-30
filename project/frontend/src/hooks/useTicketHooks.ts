import { useState, useEffect, useCallback } from 'react';
import { TicketService } from '../services/ticket.service';

export const useTickets = (initialParams?: any) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await TicketService.listTickets(params || initialParams);
      if (res.success) {
        setTickets(res.data || []);
        setMeta(res.meta || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, meta, isLoading, error, refetch: fetchTickets };
};

export const useTicketDetails = (id: string) => {
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await TicketService.getTicketById(id);
      if (res.success) {
        setTicket(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch ticket details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, isLoading, error, refetch: fetchTicket };
};
