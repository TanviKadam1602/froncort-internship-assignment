import { logger } from '../core/logger/logger';
import { connectDatabase, disconnectDatabase } from '../core/database/prisma.client';
import { disconnectRedis } from '../core/redis/redis.client';

const startWorkerRunner = async () => {
  try {
    await connectDatabase();
    logger.info('⚙️ Background Worker Runner started successfully. Listening for BullMQ jobs...');
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start worker runner process');
    process.exit(1);
  }
};

const shutdownWorker = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down worker process...`);
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
};

process.on('SIGTERM', () => shutdownWorker('SIGTERM'));
process.on('SIGINT', () => shutdownWorker('SIGINT'));

startWorkerRunner();
