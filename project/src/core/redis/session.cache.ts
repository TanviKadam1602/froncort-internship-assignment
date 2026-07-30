import { redis } from './redis.client';
import { logger } from '../logger/logger';

export interface CachedSession {
  sessionId: string;
  userId: string;
  activeOrgId: string;
  role: string;
  isPlatformSuperAdmin: boolean;
  expiresAt: string;
}

export class SessionCache {
  private static TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days matching refresh token

  /**
   * Caches active session metadata in Redis.
   */
  static async setSession(session: CachedSession): Promise<void> {
    try {
      const key = `session:${session.sessionId}`;
      const userSessionsKey = `user:sessions:${session.userId}`;

      await redis.setex(key, this.TTL_SECONDS, JSON.stringify(session));
      await redis.sadd(userSessionsKey, session.sessionId);
      await redis.expire(userSessionsKey, this.TTL_SECONDS);
    } catch (error) {
      logger.warn({ err: error, sessionId: session.sessionId }, 'Redis fallback: Failed to set session cache');
    }
  }

  /**
   * Retrieves cached session metadata from Redis.
   */
  static async getSession(sessionId: string): Promise<CachedSession | null> {
    try {
      const data = await redis.get(`session:${sessionId}`);
      if (!data) return null;
      return JSON.parse(data) as CachedSession;
    } catch (error) {
      logger.warn({ err: error, sessionId }, 'Redis fallback: Failed to get session cache');
      return null;
    }
  }

  /**
   * Deletes a cached session from Redis.
   */
  static async deleteSession(sessionId: string, userId?: string): Promise<void> {
    try {
      await redis.del(`session:${sessionId}`);
      if (userId) {
        await redis.srem(`user:sessions:${userId}`, sessionId);
      }
    } catch (error) {
      logger.warn({ err: error, sessionId }, 'Redis fallback: Failed to delete session cache');
    }
  }

  /**
   * Deletes all cached sessions for a given user from Redis (Logout All).
   */
  static async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const userSessionsKey = `user:sessions:${userId}`;
      const sessionIds = await redis.smembers(userSessionsKey);

      if (sessionIds.length > 0) {
        const keys = sessionIds.map((id) => `session:${id}`);
        await redis.del(...keys);
      }

      await redis.del(userSessionsKey);
    } catch (error) {
      logger.warn({ err: error, userId }, 'Redis fallback: Failed to delete all user sessions cache');
    }
  }
}
