import { Worker } from 'bullmq';
import { redis } from '../core/redis/redis.client';
import { logger } from '../core/logger/logger';
import { AI_DIGEST_QUEUE_NAME } from '../modules/ai-digest/queues/ai-digest.queue';
import { AIDigestService } from '../modules/ai-digest/services/ai-digest.service';

const digestService = new AIDigestService();

export function startAIDigestWorker() {
  try {
    const worker = new Worker(
      AI_DIGEST_QUEUE_NAME,
      async (job) => {
        logger.info({ jobId: job.id, name: job.name, data: job.data }, `Processing BullMQ AI Digest job ${job.id}`);

        const { userId, orgId, intervalType } = job.data;
        const mockActor: any = {
          userId,
          activeOrgId: orgId,
          role: 'ORG_ADMIN',
          isPlatformSuperAdmin: false,
        };

        return await digestService.generateDigest(mockActor, { intervalType });
      },
      {
        connection: redis as any,
        concurrency: 2,
      }
    );

    worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, `BullMQ AI Digest job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, err }, `BullMQ AI Digest job ${job?.id} failed`);
    });

    logger.info('BullMQ AI Digest Worker started');
    return worker;
  } catch (error) {
    logger.warn({ err: error }, 'Failed to start BullMQ AI Digest Worker');
    return null;
  }
}
