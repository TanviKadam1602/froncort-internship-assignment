import { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logger/logger';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req-${Math.random().toString(36).substring(2, 9)}`;
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  logger.info({
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  }, `Incoming ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    }, `Completed ${req.method} ${req.originalUrl} with ${res.statusCode} in ${duration}ms`);
  });

  next();
};
