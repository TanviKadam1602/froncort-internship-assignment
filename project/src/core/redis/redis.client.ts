import Redis from 'ioredis';
import { config } from '../../config/env.config';
import { logger } from '../logger/logger';

declare global {
  // eslint-disable-next-line no-var
  var redisGlobal: Redis | undefined;
}

const createRedisClient = (): Redis => {
  const client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  client.on('error', (err) => {
    logger.error({ err }, '❌ Redis connection error');
  });

  return client;
};

export const redis: Redis = globalThis.redisGlobal ?? createRedisClient();

if (config.NODE_ENV !== 'production') {
  globalThis.redisGlobal = redis;
}

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.quit();
    logger.info('Disconnected from Redis');
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from Redis');
  }
};
