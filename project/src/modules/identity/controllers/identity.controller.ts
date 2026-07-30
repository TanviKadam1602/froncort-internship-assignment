import { Request, Response } from 'express';
import { IdentityService } from '../services/identity.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { asyncHandler } from '../../../core/utils/async-handler';
import { ApiError } from '../../../core/utils/api-error';

export class IdentityController {
  constructor(private readonly identityService: IdentityService = new IdentityService()) {}

  /**
   * Helper: Sets HttpOnly Refresh Token Cookie
   */
  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Helper: Clears Refresh Token Cookie
   */
  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  /**
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await this.identityService.register(req.body, userAgent, ipAddress);

    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    return res.status(201).json(
      ApiResponse.created(
        {
          user: result.user,
          activeOrg: result.activeOrg,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        'User registration and organization setup successful'
      )
    );
  });

  /**
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await this.identityService.login(req.body, userAgent, ipAddress);

    this.setRefreshTokenCookie(res, result.tokens.refreshToken);

    return res.status(200).json(
      ApiResponse.success(
        {
          user: result.user,
          activeOrg: result.activeOrg,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        'Login successful'
      )
    );
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    let refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken && req.headers.cookie) {
      const match = req.headers.cookie.match(/refreshToken=([^;]+)/);
      if (match) {
        refreshToken = match[1];
      }
    }

    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required', 'MISSING_REFRESH_TOKEN');
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const tokens = await this.identityService.refresh(refreshToken, userAgent, ipAddress);

    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return res.status(200).json(
      ApiResponse.success(
        {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
        },
        'Token refreshed successfully'
      )
    );
  });

  /**
   * POST /api/v1/auth/switch-org
   */
  switchOrg = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const currentJti = (req as any).tokenJti;
    const result = await this.identityService.switchOrg(
      req.user.userId,
      req.user.sessionId,
      req.body.targetOrgId,
      currentJti
    );

    return res.status(200).json(
      ApiResponse.success(
        {
          activeOrg: result.activeOrg,
          accessToken: result.accessToken,
        },
        'Switched organization context successfully'
      )
    );
  });

  /**
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const currentJti = (req as any).tokenJti;
    const result = await this.identityService.logout(req.user.sessionId, currentJti);

    this.clearRefreshTokenCookie(res);

    return res.status(200).json(ApiResponse.success(result, 'Logged out successfully'));
  });

  /**
   * POST /api/v1/auth/logout-all
   */
  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const currentJti = (req as any).tokenJti;
    const result = await this.identityService.logoutAll(req.user.userId, currentJti);

    this.clearRefreshTokenCookie(res);

    return res.status(200).json(ApiResponse.success(result, 'Logged out from all sessions successfully'));
  });

  /**
   * GET /api/v1/auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const data = await this.identityService.getCurrentUser(req.user.userId, req.user.activeOrgId);
    return res.status(200).json(ApiResponse.success(data, 'Current user profile fetched successfully'));
  });

  /**
   * GET /api/v1/auth/sessions
   */
  getUserSessions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const sessions = await this.identityService.getUserSessions(req.user.userId);
    return res.status(200).json(ApiResponse.success(sessions, 'Active user sessions fetched successfully'));
  });
}
