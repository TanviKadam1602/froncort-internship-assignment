import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { asyncHandler } from '../../../core/utils/async-handler';
import { ApiError } from '../../../core/utils/api-error';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService = new NotificationService()) {}

  /**
   * POST /api/v1/notifications
   */
  createNotification = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const notification = await this.notificationService.createNotification(req.user, req.body);
    return res.status(201).json(ApiResponse.created(notification, 'Notification created successfully'));
  });

  /**
   * GET /api/v1/notifications
   */
  listNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;

    const result = await this.notificationService.listNotifications(req.user, page, limit, isRead);
    return res.status(200).json(ApiResponse.success(result.data, 'Notifications retrieved successfully', 200, result.meta));
  });

  /**
   * GET /api/v1/notifications/preferences
   */
  getPreferences = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prefs = await this.notificationService.getPreferences(req.user);
    return res.status(200).json(ApiResponse.success(prefs, 'Notification preferences retrieved successfully'));
  });

  /**
   * PATCH /api/v1/notifications/preferences
   */
  updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prefs = await this.notificationService.updatePreferences(req.user, req.body);
    return res.status(200).json(ApiResponse.success(prefs, 'Notification preferences updated successfully'));
  });

  /**
   * GET /api/v1/notifications/:id
   */
  getNotificationById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const notification = await this.notificationService.getNotificationById(req.user, id);
    return res.status(200).json(ApiResponse.success(notification, 'Notification details retrieved successfully'));
  });

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await this.notificationService.markAsRead(req.user, id);
    return res.status(200).json(ApiResponse.success(result, 'Notification marked as read'));
  });

  /**
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await this.notificationService.markAllAsRead(req.user);
    return res.status(200).json(ApiResponse.success(result, 'All notifications marked as read'));
  });

  /**
   * DELETE /api/v1/notifications/read
   */
  deleteReadNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const result = await this.notificationService.deleteReadNotifications(req.user);
    return res.status(200).json(ApiResponse.success(result, 'Read notifications deleted successfully'));
  });

  /**
   * DELETE /api/v1/notifications/:id
   */
  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await this.notificationService.deleteNotification(req.user, id);
    return res.status(200).json(ApiResponse.success(result, 'Notification deleted successfully'));
  });
}
