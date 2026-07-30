import { z } from 'zod';
import { ConnectionStatus, ResourceType, SharePermission } from '@prisma/client';

export const createConnectionSchema = z.object({
  body: z
    .object({
      targetOrgId: z.string().uuid('targetOrgId must be a valid UUID').optional(),
      targetOrgSlug: z.string().min(2).max(100).optional(),
    })
    .refine((data) => data.targetOrgId || data.targetOrgSlug, {
      message: 'Either targetOrgId or targetOrgSlug must be provided',
    }),
});

export const respondConnectionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid connection ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(ConnectionStatus, {
      errorMap: () => ({ message: 'Status must be ACCEPTED, REJECTED, CANCELLED, DISCONNECTED, or REVOKED' }),
    }),
  }),
});

export const shareResourceSchema = z.object({
  body: z.object({
    targetOrgId: z.string().uuid('targetOrgId must be a valid UUID'),
    resourceType: z.nativeEnum(ResourceType, {
      errorMap: () => ({ message: 'resourceType must be TICKET, PULL_REQUEST, DOCUMENT, or ATTACHMENT' }),
    }),
    resourceId: z.string().uuid('resourceId must be a valid UUID'),
    targetUserId: z.string().uuid().optional(),
    permission: z.nativeEnum(SharePermission).optional().default(SharePermission.VIEW),
  }),
});

export const updatePermissionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid resource share ID format'),
  }),
  body: z.object({
    permission: z.nativeEnum(SharePermission, {
      errorMap: () => ({ message: 'Permission must be VIEW, COMMENT, EDIT, ADMIN, or READ_COMMENT' }),
    }),
  }),
});

export const getSharedResourceByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid resource share ID format'),
  }),
});

export const revokeSharedResourceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid resource share ID format'),
  }),
});

export type CreateConnectionInputDTO = z.infer<typeof createConnectionSchema>['body'];
export type RespondConnectionInputDTO = z.infer<typeof respondConnectionSchema>['body'];
export type ShareResourceInputDTO = z.infer<typeof shareResourceSchema>['body'];
export type UpdatePermissionInputDTO = z.infer<typeof updatePermissionSchema>['body'];
