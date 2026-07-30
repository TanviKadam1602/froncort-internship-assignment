import { PrismaClient } from '@prisma/client';
import { config } from '../../config/env.config';
import { logger } from '../logger/logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log:
      config.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

  return client;
};

export const prisma: PrismaClient = globalThis.prismaGlobal ?? createPrismaClient();

if (config.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected successfully via Prisma ORM');
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to connect to PostgreSQL database');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from PostgreSQL database');
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from PostgreSQL database');
  }
};
