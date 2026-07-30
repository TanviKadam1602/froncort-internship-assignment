import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../core/utils/api-error';

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * Evaluates whether the authenticated user holds at least one of the allowed roles
 * or is a Platform Super Admin.
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Platform Super Admin bypasses organization-level role checks
    if (req.user.isPlatformSuperAdmin) {
      return next();
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(
        ApiError.forbidden(
          `Insufficient role permissions. Required: [${allowedRoles.join(', ')}]. Current: [${req.user.roles.join(', ')}]`
        )
      );
    }

    return next();
  };
};
