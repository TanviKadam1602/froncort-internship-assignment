import { Queue } from 'bullmq';
import { redis } from '../../../core/redis/redis.client';
import { logger } from '../../../core/logger/logger';

export const AI_DIGEST_QUEUE_NAME = 'ai-digest';

export let aiDigestQueue: Queue | null = null;

try {
  aiDigestQueue = new Queue(AI_DIGEST_QUEUE_NAME, {
    connection: redis as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });
  logger.info(`BullMQ Queue '${AI_DIGEST_QUEUE_NAME}' initialized successfully`);
} catch (error) {
  logger.warn({ err: error }, `BullMQ Queue '${AI_DIGEST_QUEUE_NAME}' fallback warning: Redis offline or queue error`);
}

export class AIDigestQueue {
  static async addGenerateJob(userId: string, orgId: string, intervalType: string) {
    try {
      if (aiDigestQueue) {
        return await aiDigestQueue.add('generate-digest', { userId, orgId, intervalType });
      }
    } catch (error) {
      logger.warn({ err: error }, 'Failed to enqueue BullMQ job; proceeding synchronously fallback');
    }
    return null;
  }
}
