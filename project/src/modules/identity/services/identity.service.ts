import { IdentityRepository, CreateUserData } from '../repositories/identity.repository';
import { PasswordService } from '../../../core/security/password.service';
import { JwtService } from '../../../core/security/jwt.service';
import { SessionCache } from '../../../core/redis/session.cache';
import { ApiError } from '../../../core/utils/api-error';
import { RegisterInput, LoginInput } from '../dtos/identity.dto';
import { logger } from '../../../core/logger/logger';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class IdentityService {
  constructor(private readonly identityRepo: IdentityRepository = new IdentityRepository()) {}

  /**
   * Registers a new user account, default organization, and ORG_ADMIN membership.
   */
  async register(input: RegisterInput, userAgent?: string, ipAddress?: string) {
    // 1. Check if email is already taken
    const existingUser = await this.identityRepo.findUserByEmail(input.email);
    if (existingUser) {
      throw ApiError.badRequest('An account with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    // 2. Hash password with Argon2id
    const passwordHash = await PasswordService.hashPassword(input.password);

    // 3. Create User & Org in Transaction
    const createData: CreateUserData = {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      orgName: input.orgName,
      orgSlug: input.orgSlug,
    };

    const { user, org, membership } = await this.identityRepo.createUserWithOrg(createData);

    // 4. Issue Tokens and Session
    const tokens = await this.createSessionAndTokens(
      user.id,
      user.email,
      org.id,
      [membership.role],
      user.isPlatformSuperAdmin,
      userAgent,
      ipAddress
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      },
      activeOrg: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: membership.role,
      },
      tokens,
    };
  }

  /**
   * Authenticates user credentials and creates an active session.
   * Secure: Never leaks whether a user exists or not.
   */
  async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const genericAuthError = ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');

    // 1. Find user by email
    const user = await this.identityRepo.findUserByEmail(input.email);
    if (!user) {
      // Execute dummy hash comparison to prevent timing side-channel attacks
      await PasswordService.verifyPassword('$argon2id$v=19$m=65536,t=3,p=4$dummyhashdummyhash', input.password);
      throw genericAuthError;
    }

    // 2. Verify Argon2id password
    const isPasswordValid = await PasswordService.verifyPassword(user.passwordHash, input.password);
    if (!isPasswordValid) {
      throw genericAuthError;
    }

    // 3. Fetch User Memberships
    const memberships = await this.identityRepo.findUserMemberships(user.id);
    if (memberships.length === 0) {
      throw ApiError.forbidden('User does not belong to any active organization');
    }

    const primaryMembership = memberships[0];

    // 4. Create Session and Issue Tokens
    const tokens = await this.createSessionAndTokens(
      user.id,
      user.email,
      primaryMembership.orgId,
      [primaryMembership.role],
      user.isPlatformSuperAdmin,
      userAgent,
      ipAddress
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      },
      activeOrg: {
        id: primaryMembership.org.id,
        name: primaryMembership.org.name,
        slug: primaryMembership.org.slug,
        role: primaryMembership.role,
      },
      tokens,
    };
  }

  /**
   * Refreshes access tokens and rotates refresh tokens.
   * Protects against replay attacks and invalidates old tokens.
   */
  async refresh(refreshToken: string, userAgent?: string, ipAddress?: string) {
    // 1. Verify Refresh Token JWT signature & expiration
    let decoded;
    try {
      decoded = JwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // 2. Find Session in Database
    const session = await this.identityRepo.findSessionById(decoded.sessionId);
    if (!session || session.revokedAt || new Date() > session.expiresAt) {
      throw ApiError.unauthorized('Session has been revoked or expired', 'SESSION_REVOKED');
    }

    // 3. Verify Refresh Token Hash in Constant-Time
    const isHashValid = PasswordService.verifyRefreshTokenHash(refreshToken, session.refreshTokenHash);
    if (!isHashValid) {
      // Security Event: Token reuse or tampered refresh token! Revoke session immediately.
      await this.identityRepo.revokeSession(session.id);
      await SessionCache.deleteSession(session.id, session.userId);
      logger.error({ sessionId: session.id, userId: session.userId }, 'SECURITY ALERT: Refresh token hash mismatch. Revoking session.');
      throw ApiError.unauthorized('Invalid refresh token security hash', 'TOKEN_REUSE_DETECTED');
    }

    // 4. Fetch User and Active Org Membership
    const membership = await this.identityRepo.findOrgMembership(session.userId, session.activeOrgId);
    if (!membership) {
      throw ApiError.forbidden('User no longer belongs to active organization');
    }

    // 5. Rotate Refresh Token: Generate new tokens
    const newRefresh = JwtService.signRefreshToken({
      sub: session.userId,
      sessionId: session.id,
    });

    const newAccess = JwtService.signAccessToken({
      sub: session.userId,
      email: session.user.email,
      sessionId: session.id,
      activeOrgId: session.activeOrgId,
      roles: [membership.role],
      isPlatformSuperAdmin: session.user.isPlatformSuperAdmin,
    });

    // 6. Update Stored Refresh Token Hash in DB
    const newRefreshHash = PasswordService.hashRefreshToken(newRefresh.token);
    await this.identityRepo.updateSessionRefreshTokenHash(session.id, newRefreshHash);

    // 7. Update Session Cache in Redis
    await SessionCache.setSession({
      sessionId: session.id,
      userId: session.userId,
      activeOrgId: session.activeOrgId,
      role: membership.role,
      isPlatformSuperAdmin: session.user.isPlatformSuperAdmin,
      expiresAt: session.expiresAt.toISOString(),
    });

    return {
      accessToken: newAccess.token,
      refreshToken: newRefresh.token,
      expiresIn: '15m',
    };
  }

  /**
   * Switches the active organization context for the user session.
   * Blacklists old access token and re-issues a new access token scoped to targetOrgId.
   */
  async switchOrg(userId: string, sessionId: string, targetOrgId: string, currentAccessJti?: string) {
    // 1. Verify User Membership in Target Organization
    const membership = await this.identityRepo.findOrgMembership(userId, targetOrgId);
    if (!membership) {
      throw ApiError.forbidden('User does not belong to the target organization', 'NOT_ORG_MEMBER');
    }

    // 2. Fetch User Record
    const user = await this.identityRepo.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // 3. Update Active Org in DB Session
    await this.identityRepo.updateSessionActiveOrg(sessionId, targetOrgId);

    // 4. Blacklist Previous Access Token `jti` in Redis if provided
    if (currentAccessJti) {
      await JwtService.blacklistJwt(currentAccessJti, 900); // 15 minutes TTL
    }

    // 5. Issue New Access Token bound to targetOrgId
    const newAccess = JwtService.signAccessToken({
      sub: user.id,
      email: user.email,
      sessionId,
      activeOrgId: targetOrgId,
      roles: [membership.role],
      isPlatformSuperAdmin: user.isPlatformSuperAdmin,
    });

    // 6. Update Redis Session Cache
    await SessionCache.setSession({
      sessionId,
      userId: user.id,
      activeOrgId: targetOrgId,
      role: membership.role,
      isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return {
      accessToken: newAccess.token,
      activeOrg: {
        id: membership.org.id,
        name: membership.org.name,
        slug: membership.org.slug,
        role: membership.role,
      },
    };
  }

  /**
   * Revokes the current session and blacklists the active access token `jti`.
   */
  async logout(sessionId: string, currentAccessJti?: string) {
    // 1. Revoke Session in DB
    await this.identityRepo.revokeSession(sessionId);

    // 2. Delete Redis Session Cache
    await SessionCache.deleteSession(sessionId);

    // 3. Blacklist Access Token `jti`
    if (currentAccessJti) {
      await JwtService.blacklistJwt(currentAccessJti, 900);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Revokes ALL active user sessions (Logout-All) and blacklists active access token `jti`.
   */
  async logoutAll(userId: string, currentAccessJti?: string) {
    // 1. Revoke all user sessions in DB
    await this.identityRepo.revokeAllUserSessions(userId);

    // 2. Clear all Redis session keys for user
    await SessionCache.deleteAllUserSessions(userId);

    // 3. Blacklist current access token `jti`
    if (currentAccessJti) {
      await JwtService.blacklistJwt(currentAccessJti, 900);
    }

    return { message: 'Logged out from all devices successfully' };
  }

  /**
   * Retrieves profile details and active organization context for current user.
   */
  async getCurrentUser(userId: string, activeOrgId: string) {
    const user = await this.identityRepo.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const memberships = await this.identityRepo.findUserMemberships(userId);
    const activeMembership = memberships.find((m) => m.orgId === activeOrgId);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      },
      activeOrg: activeMembership
        ? {
            id: activeMembership.org.id,
            name: activeMembership.org.name,
            slug: activeMembership.org.slug,
            role: activeMembership.role,
          }
        : null,
      memberships: memberships.map((m) => ({
        orgId: m.org.id,
        name: m.org.name,
        slug: m.org.slug,
        role: m.role,
      })),
    };
  }

  /**
   * Lists active sessions for current user.
   */
  async getUserSessions(userId: string) {
    return this.identityRepo.findUserSessions(userId);
  }

  /**
   * Internal Helper: Creates DB Session record, sets Redis cache, and returns token pair.
   */
  private async createSessionAndTokens(
    userId: string,
    email: string,
    activeOrgId: string,
    roles: string[],
    isPlatformSuperAdmin: boolean,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthTokens> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Dummy initial hash before session creation
    const dummyHash = 'pending_hash';

    // 1. Create DB Session
    const session = await this.identityRepo.createSession({
      userId,
      activeOrgId,
      refreshTokenHash: dummyHash,
      expiresAt,
      userAgent,
      ipAddress,
    });

    // 2. Sign Tokens
    const refresh = JwtService.signRefreshToken({
      sub: userId,
      sessionId: session.id,
    });

    const access = JwtService.signAccessToken({
      sub: userId,
      email,
      sessionId: session.id,
      activeOrgId,
      roles,
      isPlatformSuperAdmin,
    });

    // 3. Hash Refresh Token and Update DB
    const realRefreshHash = PasswordService.hashRefreshToken(refresh.token);
    await this.identityRepo.updateSessionRefreshTokenHash(session.id, realRefreshHash);

    // 4. Cache Session in Redis
    await SessionCache.setSession({
      sessionId: session.id,
      userId,
      activeOrgId,
      role: roles[0] || 'SUPPORT_AGENT',
      isPlatformSuperAdmin,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      expiresIn: '15m',
    };
  }
}
