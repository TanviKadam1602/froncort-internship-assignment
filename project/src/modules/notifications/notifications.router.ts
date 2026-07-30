import express, { Router } from 'express';
import { NotificationController } from './controllers/notification.controller';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createNotificationSchema,
  updatePreferencesSchema,
  getNotificationByIdSchema,
  listNotificationsQuerySchema,
} from './dtos/notification.dto';

export const notificationsRouter: Router = express.Router();
const controller = new NotificationController();

// Global Middlewares
notificationsRouter.use(authenticateMiddleware);
notificationsRouter.use(tenantContextMiddleware);

/**
 * User Notification Endpoints
 */
notificationsRouter.post(
  '/',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(createNotificationSchema),
  controller.createNotification
);

notificationsRouter.get(
  '/',
  validateRequest(listNotificationsQuerySchema),
  controller.listNotifications
);

notificationsRouter.get('/preferences', controller.getPreferences);

notificationsRouter.patch(
  '/preferences',
  validateRequest(updatePreferencesSchema),
  controller.updatePreferences
);

notificationsRouter.patch('/read-all', controller.markAllAsRead);

notificationsRouter.delete('/read', controller.deleteReadNotifications);

notificationsRouter.get(
  '/:id',
  validateRequest(getNotificationByIdSchema),
  controller.getNotificationById
);

notificationsRouter.patch(
  '/:id/read',
  validateRequest(getNotificationByIdSchema),
  controller.markAsRead
);

notificationsRouter.delete(
  '/:id',
  validateRequest(getNotificationByIdSchema),
  controller.deleteNotification
);
