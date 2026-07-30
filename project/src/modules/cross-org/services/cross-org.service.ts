import { CrossOrgRepository, CreateShareRepoData } from '../repositories/cross-org.repository';
import {
  CreateConnectionInputDTO,
  RespondConnectionInputDTO,
  ShareResourceInputDTO,
  UpdatePermissionInputDTO,
} from '../dtos/cross-org.dto';
import { AuthenticatedUser } from '../../../middleware/authenticate.middleware';
import { ApiError } from '../../../core/utils/api-error';
import { ConnectionStatus, ResourceType, SharePermission } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';
import { CollaborationAuditHook } from '../utils/audit-hook.helper';

export class CrossOrgService {
  constructor(private readonly crossOrgRepo: CrossOrgRepository = new CrossOrgRepository()) {}

  /**
   * Initiates a partner connection request to another organization.
   */
  async requestConnection(actor: AuthenticatedUser, input: CreateConnectionInputDTO) {
    let targetOrgId = input.targetOrgId;

    if (!targetOrgId && input.targetOrgSlug) {
      const targetOrg = await prisma.organization.findUnique({
        where: { slug: input.targetOrgSlug.toLowerCase() },
      });
      if (!targetOrg) {
        throw ApiError.notFound(`Target organization '${input.targetOrgSlug}' not found`, 'ORG_NOT_FOUND');
      }
      targetOrgId = targetOrg.id;
    }

    if (!targetOrgId) {
      throw ApiError.badRequest('Target organization ID or slug is required', 'MISSING_TARGET_ORG');
    }

    if (targetOrgId === actor.activeOrgId) {
      throw ApiError.badRequest('Cannot establish a cross-organization connection with your own organization', 'SELF_CONNECTION_INVALID');
    }

    const existingConn = await this.crossOrgRepo.findConnection(actor.activeOrgId, targetOrgId);
    if (existingConn) {
      throw ApiError.badRequest(`A connection between these organizations already exists (Status: ${existingConn.status})`, 'CONNECTION_EXISTS');
    }

    const conn = await this.crossOrgRepo.createConnectionRequest(actor.activeOrgId, targetOrgId);

    CollaborationAuditHook.logCollaborationEvent({
      actionType: 'CONNECTION_CREATED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      targetOrgId,
      resourceId: conn.id,
    });

    return conn;
  }

  /**
   * Lists all organization connections for the actor's active organization.
   */
  async listConnections(actor: AuthenticatedUser) {
    return this.crossOrgRepo.findConnectionsForOrg(actor.activeOrgId);
  }

  /**
   * Responds to an incoming connection request (Accept / Reject / Cancel / Disconnect).
   */
  async respondConnection(actor: AuthenticatedUser, connectionId: string, input: RespondConnectionInputDTO) {
    const conn = await this.crossOrgRepo.findConnectionById(connectionId);
    if (!conn) {
      throw ApiError.notFound('Connection request not found', 'CONNECTION_NOT_FOUND');
    }

    const isTarget = conn.targetOrgId === actor.activeOrgId;
    const isRequester = conn.requesterOrgId === actor.activeOrgId;

    if (!isTarget && !isRequester) {
      throw ApiError.forbidden('You do not have permissions to respond to this connection request', 'INSUFFICIENT_PERMISSIONS');
    }

    const isManagerOrAdmin = actor.role === 'ORG_ADMIN' || actor.role === 'SUPPORT_MANAGER' || actor.isPlatformSuperAdmin;
    if (!isManagerOrAdmin) {
      throw ApiError.forbidden('Only Org Admins or Managers can manage partner connections', 'INSUFFICIENT_PERMISSIONS');
    }

    const updated = await this.crossOrgRepo.updateConnectionStatus(connectionId, input.status as ConnectionStatus);

    if (input.status === 'ACCEPTED') {
      CollaborationAuditHook.logCollaborationEvent({
        actionType: 'CONNECTION_ACCEPTED',
        actorId: actor.userId,
        actorEmail: actor.email,
        orgId: actor.activeOrgId,
        targetOrgId: isTarget ? conn.requesterOrgId : conn.targetOrgId,
        resourceId: conn.id,
      });
    }

    return updated;
  }

  /**
   * Deletes / removes an organization connection.
   */
  async deleteConnection(actor: AuthenticatedUser, connectionId: string) {
    const conn = await this.crossOrgRepo.findConnectionById(connectionId);
    if (!conn) {
      throw ApiError.notFound('Connection not found', 'CONNECTION_NOT_FOUND');
    }

    const isMember = conn.requesterOrgId === actor.activeOrgId || conn.targetOrgId === actor.activeOrgId;
    if (!isMember && !actor.isPlatformSuperAdmin) {
      throw ApiError.forbidden('You do not have permission to delete this connection', 'INSUFFICIENT_PERMISSIONS');
    }

    await this.crossOrgRepo.deleteConnection(connectionId);

    CollaborationAuditHook.logCollaborationEvent({
      actionType: 'CONNECTION_REMOVED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: connectionId,
    });

    return { message: 'Organization connection removed successfully' };
  }

  /**
   * Shares a resource (Ticket, PR, Document, Attachment) with a connected partner organization.
   */
  async shareResource(actor: AuthenticatedUser, input: ShareResourceInputDTO) {
    const sourceOrgId = actor.activeOrgId;

    if (input.targetOrgId === sourceOrgId) {
      throw ApiError.badRequest('Cannot share resources within the same organization', 'INVALID_TARGET_ORG');
    }

    const hasActiveConn = await this.crossOrgRepo.hasActiveConnection(sourceOrgId, input.targetOrgId);
    if (!hasActiveConn) {
      throw ApiError.forbidden('Cannot share resources with an un-connected partner organization. Active connection required.', 'NO_ACTIVE_CONNECTION');
    }

    if (input.resourceType === ResourceType.TICKET) {
      const ticket = await prisma.ticket.findFirst({
        where: { id: input.resourceId, orgId: sourceOrgId, deletedAt: null },
      });
      if (!ticket) {
        throw ApiError.notFound('Ticket resource not found in your organization', 'RESOURCE_NOT_FOUND');
      }
    } else if (input.resourceType === ResourceType.PULL_REQUEST) {
      const pr = await prisma.pullRequest.findFirst({
        where: { id: input.resourceId, orgId: sourceOrgId, deletedAt: null },
      });
      if (!pr) {
        throw ApiError.notFound('Pull Request resource not found in your organization', 'RESOURCE_NOT_FOUND');
      }
    }

    const repoData: CreateShareRepoData = {
      sourceOrgId,
      targetOrgId: input.targetOrgId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      targetUserId: input.targetUserId,
      permission: input.permission ?? 'VIEW',
      sharedById: actor.userId,
    };

    const share = await this.crossOrgRepo.createSharedResource(repoData);

    CollaborationAuditHook.logCollaborationEvent({
      actionType: 'RESOURCE_SHARED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: sourceOrgId,
      targetOrgId: input.targetOrgId,
      resourceId: share.id,
      changeset: { resourceType: input.resourceType, permission: input.permission },
    });

    return share;
  }

  /**
   * Updates shared resource permission (VIEW, COMMENT, EDIT, ADMIN).
   */
  async updateSharedResourcePermission(actor: AuthenticatedUser, shareId: string, input: UpdatePermissionInputDTO) {
    const result = await this.crossOrgRepo.findSharedResourceById(shareId);
    if (!result || !result.share) {
      throw ApiError.notFound('Shared resource mapping not found', 'SHARE_NOT_FOUND');
    }

    const share = result.share;

    const isSourceOwner = share.sourceOrgId === actor.activeOrgId && (actor.role === 'ORG_ADMIN' || actor.role === 'SUPPORT_MANAGER' || share.sharedById === actor.userId);
    if (!isSourceOwner && !actor.isPlatformSuperAdmin) {
      throw ApiError.forbidden('Only resource owner or source Org Admin can update permissions', 'INSUFFICIENT_PERMISSIONS');
    }

    const updated = await this.crossOrgRepo.updateSharedResourcePermission(shareId, input.permission as SharePermission);

    CollaborationAuditHook.logCollaborationEvent({
      actionType: 'PERMISSION_UPDATED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: shareId,
      changeset: { permission: input.permission },
    });

    return updated;
  }

  /**
   * Retrieves a shared resource by share ID.
   */
  async getSharedResourceById(actor: AuthenticatedUser, shareId: string) {
    const result = await this.crossOrgRepo.findSharedResourceById(shareId);
    if (!result || !result.share) {
      throw ApiError.notFound('Shared resource mapping not found', 'SHARE_NOT_FOUND');
    }

    const share = result.share;

    const isSource = share.sourceOrgId === actor.activeOrgId;
    const isTarget = share.targetOrgId === actor.activeOrgId;

    if (!isSource && !isTarget && !actor.isPlatformSuperAdmin) {
      throw ApiError.forbidden('You do not have permission to view this shared resource', 'INSUFFICIENT_PERMISSIONS');
    }

    return {
      shareDetails: share,
      resource: result.resourcePayload,
    };
  }

  /**
   * Lists all resources shared with or by the actor's active organization.
   */
  async listSharedResources(actor: AuthenticatedUser) {
    return this.crossOrgRepo.findSharedResourcesForOrg(actor.activeOrgId);
  }

  /**
   * Revokes a shared resource mapping.
   */
  async revokeSharedResource(actor: AuthenticatedUser, shareId: string) {
    const result = await this.crossOrgRepo.findSharedResourceById(shareId);
    if (!result || !result.share) {
      throw ApiError.notFound('Shared resource mapping not found', 'SHARE_NOT_FOUND');
    }

    const share = result.share;

    const isSourceAdmin = share.sourceOrgId === actor.activeOrgId && (actor.role === 'ORG_ADMIN' || share.sharedById === actor.userId);
    if (!isSourceAdmin && !actor.isPlatformSuperAdmin) {
      throw ApiError.forbidden('Only resource owner or source Org Admin can revoke shared resources', 'INSUFFICIENT_PERMISSIONS');
    }

    await this.crossOrgRepo.deleteSharedResource(shareId);

    CollaborationAuditHook.logCollaborationEvent({
      actionType: 'RESOURCE_UNSHARED',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: shareId,
    });

    return { message: 'Shared resource mapping revoked successfully' };
  }
}
