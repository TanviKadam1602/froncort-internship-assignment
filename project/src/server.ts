import { app } from './app';
import { config } from './config/env.config';
import { connectDatabase, disconnectDatabase } from './core/database/prisma.client';
import { disconnectRedis } from './core/redis/redis.client';
import { logger } from './core/logger/logger';

let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    // 1. Connect Database & Redis
    await connectDatabase();

    // 2. Start Express HTTP Server Listener
    server = app.listen(config.PORT, () => {
      logger.info(
        `🚀 Unified Workspace API server running in [${config.NODE_ENV}] mode on http://localhost:${config.PORT}/api/v1`
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server application');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');

      // Disconnect DB and Redis resources
      await disconnectDatabase();
      await disconnectRedis();

      logger.info('Graceful shutdown completed successfully. Exiting process.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force shutdown after 10 seconds if not gracefully closed
  setTimeout(() => {
    logger.error('Forced shutdown timeout reached. Exiting immediately.');
    process.exit(1);
  }, 10000);
};

// Process Signal Listeners
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught Exceptions & Rejections
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ err: error }, 'Uncaught Exception detected! Shutting down process...');
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.fatal({ reason }, 'Unhandled Promise Rejection detected! Shutting down process...');
  process.exit(1);
});

startServer();
