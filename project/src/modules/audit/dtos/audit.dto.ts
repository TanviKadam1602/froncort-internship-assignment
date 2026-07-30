import { z } from 'zod';

export const listAuditQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(500, Math.max(1, parseInt(val, 10))) : 20)),
    actorId: z.string().uuid().optional(),
    actionType: z.string().optional(),
    module: z.string().optional(),
    resourceType: z.string().optional(),
    resourceId: z.string().uuid().optional(),
    correlationId: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['newest', 'oldest', 'action']).optional().default('newest'),
  }),
});

export const getAuditByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid audit log ID format'),
  }),
});

export const exportAuditSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    module: z.string().optional(),
    actionType: z.string().optional(),
  }),
});
