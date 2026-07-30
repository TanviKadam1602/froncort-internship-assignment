import { NotificationRepository } from '../repositories/notification.repository';
import { AuthenticatedUser } from '../../../middleware/authenticate.middleware';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository = new NotificationRepository()) {}

  async listNotifications(actor: AuthenticatedUser, page = 1, limit = 20, isRead?: boolean) {
    return this.notificationRepo.findNotificationsForUser(actor.userId, actor.activeOrgId, page, limit, isRead);
  }

  async markAsRead(actor: AuthenticatedUser, id: string) {
    await this.notificationRepo.markAsRead(id, actor.userId, actor.activeOrgId);
    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(actor: AuthenticatedUser) {
    await this.notificationRepo.markAllAsRead(actor.userId, actor.activeOrgId);
    return { message: 'All notifications marked as read' };
  }
}
