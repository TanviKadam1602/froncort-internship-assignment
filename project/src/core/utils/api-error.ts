export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(statusCode: number, message: string, errorCode = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errorCode = 'BAD_REQUEST', details?: any): ApiError {
    return new ApiError(400, message, errorCode, details);
  }

  static unauthorized(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = 'Access forbidden', errorCode = 'FORBIDDEN'): ApiError {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND'): ApiError {
    return new ApiError(404, message, errorCode);
  }

  static bolaViolation(message = 'Tenant or object authorization access denied', errorCode = 'BOLA_VIOLATION'): ApiError {
    return new ApiError(403, message, errorCode);
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL_SERVER_ERROR'): ApiError {
    return new ApiError(500, message, errorCode);
  }
}
