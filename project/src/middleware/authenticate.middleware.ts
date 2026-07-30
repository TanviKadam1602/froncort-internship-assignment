import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../core/security/jwt.service';
import { SessionCache } from '../core/redis/session.cache';
import { prisma } from '../core/database/prisma.client';
import { ApiError } from '../core/utils/api-error';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  sessionId: string;
  activeOrgId: string;
  role: string;
  roles: string[];
  isPlatformSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication Middleware
 * 1. Extracts Bearer Access Token from Authorization header.
 * 2. Verifies JWT signature and expiry.
 * 3. Checks Redis revocation blacklist (jti).
 * 4. Checks session state in Redis / PostgreSQL DB.
 * 5. Attaches authenticated user context to req.user.
 */
export const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token is required', 'MISSING_TOKEN');
    }

    const token = authHeader.substring(7);

    // 1. Verify JWT Signature and Expiry
    let payload;
    try {
      payload = JwtService.verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired access token', 'EXPIRED_ACCESS_TOKEN');
    }

    // 2. Check Redis Replay/Revocation Blacklist (jti)
    const isBlacklisted = await JwtService.isJwtBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw ApiError.unauthorized('Token has been revoked', 'TOKEN_REVOKED');
    }

    // 3. Verify Active Session (Redis Cache primary, DB fallback)
    let session = await SessionCache.getSession(payload.sessionId);
    if (!session) {
      const dbSession = await prisma.userSession.findUnique({
        where: { id: payload.sessionId },
      });

      if (!dbSession || dbSession.revokedAt || new Date() > dbSession.expiresAt) {
        throw ApiError.unauthorized('Session has been revoked or expired', 'INVALID_SESSION');
      }

      session = {
        sessionId: dbSession.id,
        userId: dbSession.userId,
        activeOrgId: dbSession.activeOrgId,
        role: payload.roles?.[0] || 'SUPPORT_AGENT',
        isPlatformSuperAdmin: payload.isPlatformSuperAdmin,
        expiresAt: dbSession.expiresAt.toISOString(),
      };

      // Populate Redis cache
      await SessionCache.setSession(session);
    }

    // 4. Attach Authenticated Context to Request
    req.user = {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
      activeOrgId: payload.activeOrgId,
      role: payload.roles?.[0] || 'SUPPORT_AGENT',
      roles: payload.roles || ['SUPPORT_AGENT'],
      isPlatformSuperAdmin: payload.isPlatformSuperAdmin,
    };

    (req as any).tokenJti = payload.jti;

    return next();
  } catch (error) {
    return next(error);
  }
};
