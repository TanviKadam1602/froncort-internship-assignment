import { logger } from '../../../core/logger/logger';

export interface AuditEventPayload {
  actionType: 'CREATE_PR' | 'APPROVE_PR' | 'REQUEST_CHANGES_PR' | 'MERGE_PR' | 'CLOSE_PR';
  actorId: string;
  actorEmail?: string;
  orgId: string;
  resourceId: string;
  changeset?: Record<string, any>;
}

export class AuditHook {
  /**
   * Reusable Audit Event Hook
   * Emits audit logs for PR actions cleanly without hardcoding dependencies.
   */
  static logPrEvent(payload: AuditEventPayload): void {
    logger.info(
      {
        auditEvent: true,
        actionType: payload.actionType,
        actorId: payload.actorId,
        orgId: payload.orgId,
        resourceType: 'PULL_REQUEST',
        resourceId: payload.resourceId,
        changeset: payload.changeset,
      },
      `Audit Hook Triggered: ${payload.actionType} on PR ${payload.resourceId}`
    );
  }
}
