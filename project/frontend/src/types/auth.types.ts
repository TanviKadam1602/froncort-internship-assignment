export type OrgRole = 'ORG_ADMIN' | 'SUPPORT_MANAGER' | 'SUPPORT_AGENT' | 'REVIEWER_APPROVER' | 'USER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isPlatformSuperAdmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
}

export interface UserMembership {
  id: string;
  orgId: string;
  role: OrgRole;
  org: Organization;
}

export interface AuthSession {
  user: User;
  activeOrg: Organization;
  memberships: UserMembership[];
  accessToken: string;
}
