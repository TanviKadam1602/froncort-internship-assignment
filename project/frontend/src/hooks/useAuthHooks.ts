import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/auth.service';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const executeLogin = async (data: { email: string; password: string; orgSlug?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthService.login(data);
      if (res.success && res.data) {
        login(res.data.accessToken, res.data.user, res.data.activeOrg, res.data.memberships);
        router.push('/dashboard');
        return res.data;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { login: executeLogin, isLoading, error };
};

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const executeRegister = async (data: {
    email: string;
    password: string;
    fullName: string;
    orgName: string;
    orgSlug: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthService.register(data);
      if (res.success && res.data) {
        login(res.data.accessToken, res.data.user, res.data.activeOrg, res.data.memberships);
        router.push('/dashboard');
        return res.data;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { register: executeRegister, isLoading, error };
};

export const useCurrentUser = () => {
  const { user, activeOrg, memberships, isAuthenticated, isLoading, refreshSession } = useAuth();
  return { user, activeOrg, memberships, isAuthenticated, isLoading, refreshSession };
};

export const useOrganizations = () => {
  const { memberships, activeOrg } = useAuth();
  return {
    organizations: memberships.map((m) => m.org),
    memberships,
    activeOrg,
  };
};

export const useSwitchOrganization = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { switchOrg } = useAuth();

  const executeSwitch = async (orgId: string) => {
    setIsLoading(true);
    try {
      await switchOrg(orgId);
    } finally {
      setIsLoading(false);
    }
  };

  return { switchOrg: executeSwitch, isLoading };
};
