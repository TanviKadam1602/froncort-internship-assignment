import { OrgRole, Prisma } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  orgName: string;
  orgSlug: string;
}

export interface CreateSessionData {
  userId: string;
  activeOrgId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export class IdentityRepository {
  /**
   * Finds a user record by email address.
   */
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  /**
   * Finds a user record by ID.
   */
  async findUserById(userId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  /**
   * Creates a user account, default organization, and ORG_ADMIN membership inside an interactive transaction.
   */
  async createUserWithOrg(data: CreateUserData) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: data.orgName,
          slug: data.orgSlug,
        },
      });

      // 2. Create User
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          fullName: data.fullName,
        },
      });

      // 3. Create OrgMembership as ORG_ADMIN
      const membership = await tx.orgMember.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: OrgRole.ORG_ADMIN,
        },
      });

      return { user, org, membership };
    });
  }

  /**
   * Finds an org membership mapping for a specific user and organization.
   */
  async findOrgMembership(userId: string, orgId: string) {
    return prisma.orgMember.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
      include: {
        org: true,
      },
    });
  }

  /**
   * Lists all organization memberships belonging to a user.
   */
  async findUserMemberships(userId: string) {
    return prisma.orgMember.findMany({
      where: {
        userId,
      },
      include: {
        org: true,
      },
    });
  }

  /**
   * Creates a new user session record.
   */
  async createSession(data: CreateSessionData) {
    return prisma.userSession.create({
      data: {
        userId: data.userId,
        activeOrgId: data.activeOrgId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  }

  /**
   * Finds a session by ID.
   */
  async findSessionById(sessionId: string) {
    return prisma.userSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
        activeOrg: true,
      },
    });
  }

  /**
   * Lists all active user sessions for a user.
   */
  async findUserSessions(userId: string) {
    return prisma.userSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        activeOrgId: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
        activeOrg: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Updates the refresh token hash for a session (Refresh Token Rotation).
   */
  async updateSessionRefreshTokenHash(sessionId: string, newHash: string) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newHash,
      },
    });
  }

  /**
   * Updates the active organization context for a session.
   */
  async updateSessionActiveOrg(sessionId: string, newActiveOrgId: string) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: {
        activeOrgId: newActiveOrgId,
      },
    });
  }

  /**
   * Revokes a specific session by setting revokedAt = NOW().
   */
  async revokeSession(sessionId: string) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revokes all active sessions for a user (Logout-All).
   */
  async revokeAllUserSessions(userId: string) {
    return prisma.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
