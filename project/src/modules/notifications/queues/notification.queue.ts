import { Queue } from 'bullmq';
import { redis } from '../../../core/redis/redis.client';
import { logger } from '../../../core/logger/logger';

export const NOTIFICATION_QUEUE_NAME = 'notifications';

export let notificationQueue: Queue | null = null;

try {
  notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });
  logger.info(`BullMQ Queue '${NOTIFICATION_QUEUE_NAME}' initialized successfully`);
} catch (error) {
  logger.warn({ err: error }, `BullMQ Queue '${NOTIFICATION_QUEUE_NAME}' fallback warning: Redis offline or queue error`);
}

export class NotificationQueue {
  static async addNotificationJob(userId: string, orgId: string, type: string, title: string, message: string) {
    try {
      if (notificationQueue) {
        return await notificationQueue.add('create-notification', { userId, orgId, type, title, message });
      }
    } catch (error) {
      logger.warn({ err: error }, 'Failed to enqueue notification BullMQ job; proceeding synchronously');
    }
    return null;
  }
}
