import pino from 'pino';
import { config } from '../../config/env.config';

const isDev = config.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'refreshToken',
      'accessToken',
      'secret',
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const createChildLogger = (moduleName: string) => {
  return logger.child({ module: moduleName });
};
