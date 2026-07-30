import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../core/utils/api-error';

/**
 * Tenant Context Middleware
 * Verifies that the authenticated request carries a valid active organization context.
 */
export const tenantContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.activeOrgId) {
    return next(ApiError.forbidden('Active organization context is required to access this resource'));
  }
  return next();
};
