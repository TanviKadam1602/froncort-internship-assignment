import { logger } from '../../../core/logger/logger';

export interface CollaborationAuditEventPayload {
  actionType:
    | 'CONNECTION_CREATED'
    | 'CONNECTION_ACCEPTED'
    | 'CONNECTION_REMOVED'
    | 'RESOURCE_SHARED'
    | 'PERMISSION_UPDATED'
    | 'RESOURCE_UNSHARED';
  actorId: string;
  actorEmail?: string;
  orgId: string;
  targetOrgId?: string;
  resourceId: string;
  changeset?: Record<string, any>;
}

export class CollaborationAuditHook {
  /**
   * Reusable Audit Event Hook for Cross-Org Collaboration lifecycle events.
   */
  static logCollaborationEvent(payload: CollaborationAuditEventPayload): void {
    logger.info(
      {
        auditEvent: true,
        actionType: payload.actionType,
        actorId: payload.actorId,
        orgId: payload.orgId,
        targetOrgId: payload.targetOrgId,
        resourceType: 'CROSS_ORG_COLLABORATION',
        resourceId: payload.resourceId,
        changeset: payload.changeset,
      },
      `Audit Hook Triggered: ${payload.actionType} on ${payload.resourceId}`
    );
  }
}
