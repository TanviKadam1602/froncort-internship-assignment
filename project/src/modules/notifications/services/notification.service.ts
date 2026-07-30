import { NotificationRepository } from '../repositories/notification.repository';
import { AuthenticatedUser } from '../../../middleware/authenticate.middleware';
import { ApiError } from '../../../core/utils/api-error';
import { CreateNotificationInputDTO, UpdatePreferencesInputDTO } from '../dtos/notification.dto';
import { NotificationAuditHook } from '../utils/audit-hook.helper';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository = new NotificationRepository()) {}

  async createNotification(actor: AuthenticatedUser, input: CreateNotificationInputDTO) {
    const targetUserId = input.userId || actor.userId;
    const notification = await this.notificationRepo.createNotification({
      userId: targetUserId,
      orgId: actor.activeOrgId,
      type: input.type,
      title: input.title,
      message: input.message,
      linkUrl: input.linkUrl,
    });

    NotificationAuditHook.logNotificationEvent({
      actionType: 'NOTIFICATION_CREATED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: notification.id,
      changeset: { type: input.type, title: input.title },
    });

    return notification;
  }

  async listNotifications(actor: AuthenticatedUser, page = 1, limit = 20, isRead?: boolean) {
    return this.notificationRepo.findNotificationsForUser(actor.userId, actor.activeOrgId, page, limit, isRead);
  }

  async getNotificationById(actor: AuthenticatedUser, id: string) {
    const notification = await this.notificationRepo.findNotificationById(id, actor.userId, actor.activeOrgId);
    if (!notification) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
    return notification;
  }

  async markAsRead(actor: AuthenticatedUser, id: string) {
    await this.notificationRepo.markAsRead(id, actor.userId, actor.activeOrgId);

    NotificationAuditHook.logNotificationEvent({
      actionType: 'NOTIFICATION_READ',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: id,
    });

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(actor: AuthenticatedUser) {
    await this.notificationRepo.markAllAsRead(actor.userId, actor.activeOrgId);
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(actor: AuthenticatedUser, id: string) {
    const existing = await this.notificationRepo.findNotificationById(id, actor.userId, actor.activeOrgId);
    if (!existing) {
      throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
    await this.notificationRepo.deleteNotification(id, actor.userId, actor.activeOrgId);

    NotificationAuditHook.logNotificationEvent({
      actionType: 'NOTIFICATION_DELETED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: id,
    });

    return { message: 'Notification deleted successfully' };
  }

  async deleteReadNotifications(actor: AuthenticatedUser) {
    await this.notificationRepo.deleteReadNotifications(actor.userId, actor.activeOrgId);
    return { message: 'All read notifications deleted successfully' };
  }

  async getPreferences(actor: AuthenticatedUser) {
    return this.notificationRepo.getPreferences(actor.userId, actor.activeOrgId);
  }

  async updatePreferences(actor: AuthenticatedUser, input: UpdatePreferencesInputDTO) {
    const updated = await this.notificationRepo.upsertPreferences(actor.userId, actor.activeOrgId, input);

    NotificationAuditHook.logNotificationEvent({
      actionType: 'PREFERENCE_UPDATED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: updated.id,
      changeset: input,
    });

    return updated;
  }
}
