import { NotificationType } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';

export interface CreateNotificationRepoData {
  userId: string;
  orgId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
}

export class NotificationRepository {
  /**
   * Creates a new notification.
   */
  async createNotification(data: CreateNotificationRepoData) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        orgId: data.orgId,
        type: data.type,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl,
      },
    });
  }

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
   * Retrieves a single notification by ID.
   */
  async findNotificationById(id: string, userId: string, activeOrgId: string) {
    return prisma.notification.findFirst({
      where: { id, userId, orgId: activeOrgId },
    });
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

  /**
   * Deletes a single notification by ID.
   */
  async deleteNotification(id: string, userId: string, activeOrgId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId, orgId: activeOrgId },
    });
  }

  /**
   * Deletes all read notifications for user cleanup.
   */
  async deleteReadNotifications(userId: string, activeOrgId: string) {
    return prisma.notification.deleteMany({
      where: { userId, orgId: activeOrgId, isRead: true },
    });
  }

  /**
   * Gets or creates user notification preferences.
   */
  async getPreferences(userId: string, activeOrgId: string) {
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId_orgId: { userId, orgId: activeOrgId } },
    });

    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: {
          userId,
          orgId: activeOrgId,
        },
      });
    }

    return pref;
  }

  /**
   * Upserts notification preferences.
   */
  async upsertPreferences(userId: string, activeOrgId: string, data: any) {
    return prisma.notificationPreference.upsert({
      where: { userId_orgId: { userId, orgId: activeOrgId } },
      create: {
        userId,
        orgId: activeOrgId,
        ...data,
      },
      update: data,
    });
  }
}
