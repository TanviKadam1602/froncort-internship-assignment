import { z } from 'zod';

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
