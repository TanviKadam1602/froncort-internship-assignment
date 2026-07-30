import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { OrgRole } from '../../types/auth.types';

export interface RoleGuardProps {
  roles: OrgRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children, fallback = null }) => {
  const { activeOrg, memberships, user } = useAuth();

  if (!user) return <>{fallback}</>;
  if (user.isPlatformSuperAdmin) return <>{children}</>;

  const currentMembership = memberships.find((m) => m.orgId === activeOrg?.id);
  const currentRole = currentMembership?.role;

  if (currentRole && roles.includes(currentRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export const PermissionGuard = RoleGuard;
