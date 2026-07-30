import express, { Router } from 'express';
import { NotificationController } from './controllers/notification.controller';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { getNotificationByIdSchema, listNotificationsQuerySchema } from './dtos/notification.dto';

export const notificationsRouter: Router = express.Router();
const controller = new NotificationController();

// Global Middlewares
notificationsRouter.use(authenticateMiddleware);
notificationsRouter.use(tenantContextMiddleware);

/**
 * User Notification Endpoints
 */
notificationsRouter.get('/', validateRequest(listNotificationsQuerySchema), controller.listNotifications);
notificationsRouter.patch('/read-all', controller.markAllAsRead);
notificationsRouter.patch('/:id/read', validateRequest(getNotificationByIdSchema), controller.markAsRead);
