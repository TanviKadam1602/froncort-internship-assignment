import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization, UserMembership } from '../types/auth.types';
import { apiClient, setAccessToken } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  activeOrg: Organization | null;
  memberships: UserMembership[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, activeOrg: Organization, memberships: UserMembership[]) => void;
  logout: () => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const data = res.data?.data;
      if (data) {
        setUser(data.user);
        setActiveOrg(data.activeOrg);
        setMemberships(data.memberships || []);
      }
    } catch {
      setUser(null);
      setActiveOrg(null);
      setMemberships([]);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const handleUnauthorized = () => {
      setUser(null);
      setActiveOrg(null);
      setMemberships([]);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = (token: string, u: User, org: Organization, mems: UserMembership[]) => {
    setAccessToken(token);
    setUser(u);
    setActiveOrg(org);
    setMemberships(mems);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore error on logout
    } finally {
      setUser(null);
      setActiveOrg(null);
      setMemberships([]);
      setAccessToken(null);
    }
  };

  const switchOrg = async (orgId: string) => {
    const res = await apiClient.post('/auth/switch-org', { targetOrgId: orgId });
    const newAccessToken = res.data?.data?.accessToken;
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      await refreshSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        memberships,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchOrg,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
