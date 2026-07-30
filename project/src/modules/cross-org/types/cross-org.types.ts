import { ConnectionStatus, ResourceType, SharePermission } from '@prisma/client';

export interface CreateConnectionInput {
  targetOrgSlug?: string;
  targetOrgId?: string;
}

export interface RespondConnectionInput {
  status: ConnectionStatus; // ACCEPTED | REJECTED | REVOKED
}

export interface ShareResourceInput {
  targetOrgId: string;
  resourceType: ResourceType; // TICKET | PULL_REQUEST
  resourceId: string;
  targetUserId?: string;
  permission?: SharePermission; // READ_COMMENT
}
