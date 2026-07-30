import { useState, useEffect, useCallback } from 'react';
import { AuditService } from '../services/audit.service';

export const useAuditLogs = (initialParams?: any) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuditService.listAuditLogs(params || initialParams);
      if (res.success) {
        setLogs(res.data || []);
        setMeta(res.meta || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, meta, isLoading, error, refetch: fetchLogs };
};

export const useAuditVerification = () => {
  const [verification, setVerification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const verify = async () => {
    setIsLoading(true);
    try {
      const res = await AuditService.verifyHashChain();
      if (res.success) {
        setVerification(res.data);
      }
    } catch {
      setVerification({ isChainValid: false, message: 'Verification API error' });
    } finally {
      setIsLoading(false);
    }
  };

  return { verification, isLoading, verify };
};
