import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../core/utils/api-error';
import { logger } from '../core/logger/logger';
import { config } from '../config/env.config';

export const globalErrorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const requestId = res.getHeader('x-request-id') || req.headers['x-request-id'];

  // Handle Domain ApiError
  if (err instanceof ApiError) {
    logger.warn({
      requestId,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      message: err.message,
      url: req.originalUrl,
    }, `API Error: ${err.message}`);

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details || null,
      },
    });
  }

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn({
      requestId,
      url: req.originalUrl,
      errors: formattedErrors,
    }, 'Zod Validation Error');

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload parameters',
        details: formattedErrors,
      },
    });
  }

  // Handle Unexpected Server Errors
  logger.error({
    requestId,
    err,
    stack: err.stack,
    url: req.originalUrl,
  }, 'Unhandled Exception caught in global error middleware');

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.NODE_ENV === 'production' ? 'Internal server error occurred' : err.message,
    },
  });
};
