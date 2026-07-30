import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid('userId must be a valid UUID').optional(),
    type: z.nativeEnum(NotificationType, {
      errorMap: () => ({ message: 'Invalid notification type' }),
    }),
    title: z.string().min(1).max(255),
    message: z.string().min(1),
    linkUrl: z.string().url().optional(),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
    digestNotifications: z.boolean().optional(),
    prReviewNotifications: z.boolean().optional(),
  }),
});

export const getNotificationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID format'),
  }),
});

export const listNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
    isRead: z.string().optional().transform((val) => (val !== undefined ? val === 'true' : undefined)),
  }),
});

export type CreateNotificationInputDTO = z.infer<typeof createNotificationSchema>['body'];
export type UpdatePreferencesInputDTO = z.infer<typeof updatePreferencesSchema>['body'];
