import { prisma } from '../../../core/database/prisma.client';

export class NotificationRepository {
  /**
   * Retrieves paginated notifications for user in active organization.
   */
  async findNotificationsForUser(userId: string, activeOrgId: string, page = 1, limit = 20, isRead?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = { userId, orgId: activeOrgId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [notifications, totalRecords, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, orgId: activeOrgId, isRead: false } }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      data: notifications,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        unreadCount,
      },
    };
  }

  /**
   * Marks a notification as read.
   */
  async markAsRead(id: string, userId: string, activeOrgId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, orgId: activeOrgId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications as read for a user in the active organization.
   */
  async markAllAsRead(userId: string, activeOrgId: string) {
    return prisma.notification.updateMany({
      where: { userId, orgId: activeOrgId, isRead: false },
      data: { isRead: true },
    });
  }
}
