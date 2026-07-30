import { useState, useEffect, useCallback } from 'react';
import { PRService } from '../services/pr.service';

export const usePRs = (initialParams?: any) => {
  const [prs, setPRs] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPRs = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await PRService.listPRs(params || initialParams);
      if (res.success) {
        setPRs(res.data || []);
        setMeta(res.meta || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch Pull Requests');
    } finally {
      setIsLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchPRs();
  }, [fetchPRs]);

  return { prs, meta, isLoading, error, refetch: fetchPRs };
};

export const usePRDetails = (id: string) => {
  const [pr, setPR] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPR = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await PRService.getPRById(id);
      if (res.success) {
        setPR(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch Pull Request details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPR();
  }, [fetchPR]);

  return { pr, isLoading, error, refetch: fetchPR };
};
