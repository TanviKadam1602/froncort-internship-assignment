import { ConnectionStatus, ResourceType, SharePermission } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';

export interface CreateShareRepoData {
  sourceOrgId: string;
  targetOrgId: string;
  resourceType: ResourceType;
  resourceId: string;
  targetUserId?: string;
  permission: SharePermission;
  sharedById: string;
}

export class CrossOrgRepository {
  /**
   * Finds an existing connection between two specific organizations.
   */
  async findConnection(requesterOrgId: string, targetOrgId: string) {
    return prisma.orgConnection.findFirst({
      where: {
        OR: [
          { requesterOrgId, targetOrgId },
          { requesterOrgId: targetOrgId, targetOrgId: requesterOrgId },
        ],
      },
      include: {
        requesterOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Checks if an ACCEPTED connection exists between two organizations.
   */
  async hasActiveConnection(orgAId: string, orgBId: string): Promise<boolean> {
    const conn = await prisma.orgConnection.findFirst({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [
          { requesterOrgId: orgAId, targetOrgId: orgBId },
          { requesterOrgId: orgBId, targetOrgId: orgAId },
        ],
      },
    });
    return !!conn;
  }

  /**
   * Creates a new connection request.
   */
  async createConnectionRequest(requesterOrgId: string, targetOrgId: string) {
    return prisma.orgConnection.create({
      data: {
        requesterOrgId,
        targetOrgId,
        status: ConnectionStatus.PENDING,
      },
      include: {
        requesterOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Finds a connection by ID.
   */
  async findConnectionById(connectionId: string) {
    return prisma.orgConnection.findUnique({
      where: { id: connectionId },
      include: {
        requesterOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Updates connection status (ACCEPTED, REJECTED, CANCELLED, DISCONNECTED, REVOKED).
   */
  async updateConnectionStatus(connectionId: string, status: ConnectionStatus) {
    return prisma.orgConnection.update({
      where: { id: connectionId },
      data: {
        status,
        respondedAt: new Date(),
      },
      include: {
        requesterOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Deletes a connection record.
   */
  async deleteConnection(connectionId: string) {
    return prisma.orgConnection.delete({
      where: { id: connectionId },
    });
  }

  /**
   * Lists all organization connections involving orgId.
   */
  async findConnectionsForOrg(orgId: string) {
    return prisma.orgConnection.findMany({
      where: {
        OR: [{ requesterOrgId: orgId }, { targetOrgId: orgId }],
      },
      orderBy: { requestedAt: 'desc' },
      include: {
        requesterOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Creates a shared resource mapping.
   */
  async createSharedResource(data: CreateShareRepoData) {
    return prisma.sharedResource.create({
      data: {
        sourceOrgId: data.sourceOrgId,
        targetOrgId: data.targetOrgId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        targetUserId: data.targetUserId,
        permission: data.permission,
        sharedById: data.sharedById,
      },
      include: {
        sourceOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
        sharedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /**
   * Updates shared resource permission.
   */
  async updateSharedResourcePermission(shareId: string, permission: SharePermission) {
    return prisma.sharedResource.update({
      where: { id: shareId },
      data: { permission },
      include: {
        sourceOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
        sharedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /**
   * Retrieves a shared resource record by share ID.
   */
  async findSharedResourceById(shareId: string) {
    const share = await prisma.sharedResource.findUnique({
      where: { id: shareId },
      include: {
        sourceOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
        sharedBy: { select: { id: true, fullName: true, email: true } },
        targetUser: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!share) return null;

    let payload: any = null;
    if (share.resourceType === ResourceType.TICKET) {
      payload = await prisma.ticket.findFirst({
        where: { id: share.resourceId, deletedAt: null },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          assignee: { select: { id: true, fullName: true, email: true } },
          comments: {
            where: { deletedAt: null },
            include: {
              author: { select: { id: true, fullName: true, email: true } },
              authorOrg: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });
    } else if (share.resourceType === ResourceType.PULL_REQUEST) {
      payload = await prisma.pullRequest.findFirst({
        where: { id: share.resourceId, deletedAt: null },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          reviewers: { include: { reviewer: { select: { id: true, fullName: true, email: true } } } },
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
          comments: {
            where: { deletedAt: null },
            include: {
              author: { select: { id: true, fullName: true, email: true } },
              authorOrg: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });
    }

    return {
      share,
      resourcePayload: payload,
    };
  }

  /**
   * Lists resources shared with or shared by an organization.
   */
  async findSharedResourcesForOrg(orgId: string) {
    return prisma.sharedResource.findMany({
      where: {
        OR: [{ sourceOrgId: orgId }, { targetOrgId: orgId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sourceOrg: { select: { id: true, name: true, slug: true } },
        targetOrg: { select: { id: true, name: true, slug: true } },
        sharedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  /**
   * Revokes / deletes a shared resource mapping.
   */
  async deleteSharedResource(shareId: string) {
    return prisma.sharedResource.delete({
      where: { id: shareId },
    });
  }
}
