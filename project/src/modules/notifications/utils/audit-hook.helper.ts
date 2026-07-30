import { logger } from '../../../core/logger/logger';

export interface NotificationAuditEventPayload {
  actionType:
    | 'NOTIFICATION_CREATED'
    | 'NOTIFICATION_READ'
    | 'NOTIFICATION_DELETED'
    | 'PREFERENCE_UPDATED';
  actorId: string;
  actorEmail?: string;
  orgId: string;
  resourceId: string;
  changeset?: Record<string, any>;
}

export class NotificationAuditHook {
  /**
   * Reusable Audit Event Hook for Notification lifecycle events.
   */
  static logNotificationEvent(payload: NotificationAuditEventPayload): void {
    logger.info(
      {
        auditEvent: true,
        actionType: payload.actionType,
        actorId: payload.actorId,
        orgId: payload.orgId,
        resourceType: 'NOTIFICATION',
        resourceId: payload.resourceId,
        changeset: payload.changeset,
      },
      `Audit Hook Triggered: ${payload.actionType} on ${payload.resourceId}`
    );
  }
}
