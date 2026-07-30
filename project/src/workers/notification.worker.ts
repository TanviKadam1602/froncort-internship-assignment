import { Worker } from 'bullmq';
import { redis } from '../core/redis/redis.client';
import { logger } from '../core/logger/logger';
import { NOTIFICATION_QUEUE_NAME } from '../modules/notifications/queues/notification.queue';
import { NotificationService } from '../modules/notifications/services/notification.service';

const notificationService = new NotificationService();

export function startNotificationWorker() {
  try {
    const worker = new Worker(
      NOTIFICATION_QUEUE_NAME,
      async (job) => {
        logger.info({ jobId: job.id, name: job.name, data: job.data }, `Processing BullMQ notification job ${job.id}`);

        const { userId, orgId, type, title, message } = job.data;
        const mockActor: any = {
          userId,
          activeOrgId: orgId,
          role: 'USER',
          isPlatformSuperAdmin: false,
        };

        return await notificationService.createNotification(mockActor, { userId, type, title, message });
      },
      {
        connection: redis as any,
        concurrency: 5,
      }
    );

    worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, `BullMQ notification job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, err }, `BullMQ notification job ${job?.id} failed`);
    });

    logger.info('BullMQ Notification Worker started');
    return worker;
  } catch (error) {
    logger.warn({ err: error }, 'Failed to start BullMQ Notification Worker');
    return null;
  }
}
