import React from 'react';
import { OrgRole } from '../../types/auth.types';
import { Badge } from '../ui/Badge';

export interface RoleBadgeProps {
  role: OrgRole | string;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const roleVariants: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'neutral'> = {
    ORG_ADMIN: 'danger',
    SUPPORT_MANAGER: 'warning',
    SUPPORT_AGENT: 'info',
    REVIEWER_APPROVER: 'success',
    USER: 'neutral',
  };

  const variant = roleVariants[role] || 'neutral';

  return (
    <Badge variant={variant} className={`font-mono uppercase tracking-wider text-[10px] ${className}`}>
      {role.replace('_', ' ')}
    </Badge>
  );
};
