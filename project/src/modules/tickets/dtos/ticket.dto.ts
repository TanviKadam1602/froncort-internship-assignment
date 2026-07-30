import { z } from 'zod';
import { TicketStatus, TicketPriority } from '@prisma/client';

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').max(255).trim(),
    description: z.string().min(5, 'Description must be at least 5 characters long').trim(),
    priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
    category: z.string().max(100).optional().default('GENERAL'),
    assigneeId: z.string().uuid('assigneeId must be a valid UUID').optional(),
    dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO date string' }).optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    title: z.string().min(3).max(255).trim().optional(),
    description: z.string().min(5).trim().optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    category: z.string().max(100).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    assigneeId: z.string().uuid('assigneeId must be a valid UUID'),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(TicketStatus, {
      errorMap: () => ({ message: 'Invalid ticket status. Allowed: OPEN, IN_PROGRESS, RESOLVED, CLOSED' }),
    }),
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty').trim(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid('Invalid comment ID format'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty').trim(),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid('Invalid comment ID format'),
  }),
});

export const createAttachmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
  body: z.object({
    fileName: z.string().min(1, 'File name is required').max(255),
    fileUrl: z.string().url('fileUrl must be a valid URL'),
    fileSize: z.number().int().positive('fileSize must be a positive integer'),
    mimeType: z.string().min(1, 'mimeType is required').max(100),
  }),
});

export const getTicketByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID format'),
  }),
});

export const listTicketsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    category: z.string().optional(),
    assigneeId: z.string().uuid().optional(),
    authorId: z.string().uuid().optional(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['newest', 'oldest', 'priority', 'updatedAt']).optional().default('newest'),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>['body'];
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>['body'];
export type AssignTicketInput = z.infer<typeof assignTicketSchema>['body'];
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>['body'];
export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>['body'];
