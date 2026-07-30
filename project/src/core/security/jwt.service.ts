import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../../config/env.config';
import { redis } from '../redis/redis.client';
import { logger } from '../logger/logger';

export interface JwtAccessPayload {
  sub: string; // userId
  email: string;
  sessionId: string;
  activeOrgId: string;
  roles: string[];
  isPlatformSuperAdmin: boolean;
  jti: string; // unique token ID
  tokenVersion: number;
}

export interface JwtRefreshPayload {
  sub: string; // userId
  sessionId: string;
  jti: string;
}

export class JwtService {
  /**
   * Signs a short-lived JWT Access Token.
   */
  static signAccessToken(payload: Omit<JwtAccessPayload, 'jti' | 'tokenVersion'>): { token: string; jti: string } {
    const jti = randomUUID();
    const fullPayload: JwtAccessPayload = {
      ...payload,
      jti,
      tokenVersion: 1,
    };

    const options: SignOptions = {
      expiresIn: config.JWT_ACCESS_EXPIRATION as any,
    };

    const token = jwt.sign(fullPayload, config.JWT_ACCESS_SECRET, options);
    return { token, jti };
  }

  /**
   * Signs a long-lived Refresh Token.
   */
  static signRefreshToken(payload: Omit<JwtRefreshPayload, 'jti'>): { token: string; jti: string } {
    const jti = randomUUID();
    const fullPayload: JwtRefreshPayload = {
      ...payload,
      jti,
    };

    const options: SignOptions = {
      expiresIn: config.JWT_REFRESH_EXPIRATION as any,
    };

    const token = jwt.sign(fullPayload, config.JWT_REFRESH_SECRET, options);
    return { token, jti };
  }

  /**
   * Verifies an Access Token signature and expiry.
   */
  static verifyAccessToken(token: string): JwtAccessPayload {
    return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtAccessPayload;
  }

  /**
   * Verifies a Refresh Token signature and expiry.
   */
  static verifyRefreshToken(token: string): JwtRefreshPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtRefreshPayload;
  }

  /**
   * Adds a JWT `jti` to the Redis revocation blacklist until token expiry.
   */
  static async blacklistJwt(jti: string, ttlSeconds = 900): Promise<void> {
    try {
      if (ttlSeconds > 0) {
        await redis.setex(`jwt:blacklist:${jti}`, ttlSeconds, 'revoked');
      }
    } catch (error) {
      logger.error({ err: error, jti }, 'Failed to blacklist JWT in Redis; fallback warning');
    }
  }

  /**
   * Checks if a JWT `jti` exists in the Redis revocation blacklist.
   */
  static async isJwtBlacklisted(jti: string): Promise<boolean> {
    try {
      const result = await redis.get(`jwt:blacklist:${jti}`);
      return result === 'revoked';
    } catch (error) {
      logger.error({ err: error, jti }, 'Redis error checking JWT blacklist; assuming not blacklisted');
      return false;
    }
  }
}
