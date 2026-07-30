import { Prisma } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';
import { AuditFilterOptions } from '../types/audit.types';
import { HashChainBuilder } from '../utils/hash-chain.builder';

export interface CreateAuditRepoData {
  actorId: string;
  actorEmail: string;
  orgId: string;
  actionType: string;
  module?: string;
  resourceType: string;
  resourceId: string;
  changeset?: any;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

export class AuditRepository {
  /**
   * Appends a new immutable audit record to the cryptographic hash chain.
   */
  async createAuditEntry(data: CreateAuditRepoData) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch latest record for organization to get previous hash
      const lastRecord = await tx.auditLog.findFirst({
        where: { orgId: data.orgId },
        orderBy: { timestamp: 'desc' },
      });

      const previousHash = lastRecord ? lastRecord.currentHash || lastRecord.previousHash : null;
      const timestamp = new Date();

      // 2. Compute SHA-256 current hash
      const currentHash = HashChainBuilder.calculateHash({
        previousHash,
        timestamp,
        actorId: data.actorId,
        actionType: data.actionType,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        changeset: data.changeset,
      });

      // 3. Insert record
      return tx.auditLog.create({
        data: {
          timestamp,
          actorId: data.actorId,
          actorEmail: data.actorEmail,
          orgId: data.orgId,
          actionType: data.actionType,
          module: data.module || 'SYSTEM',
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          changeset: data.changeset ? (data.changeset as any) : undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          correlationId: data.correlationId,
          previousHash,
          currentHash,
        },
        include: {
          actor: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          org: { select: { id: true, name: true, slug: true } },
        },
      });
    });
  }

  /**
   * Retrieves a single audit log entry by ID with tenant isolation.
   */
  async findAuditById(id: string, activeOrgId: string) {
    return prisma.auditLog.findFirst({
      where: { id, orgId: activeOrgId },
      include: {
        actor: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        org: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Searches and filters audit logs with pagination & sorting.
   */
  async findAuditLogs(activeOrgId: string, options: AuditFilterOptions) {
    const where: Prisma.AuditLogWhereInput = {
      orgId: activeOrgId,
    };

    if (options.actorId) where.actorId = options.actorId;
    if (options.actionType) where.actionType = options.actionType;
    if (options.module) where.module = options.module;
    if (options.resourceType) where.resourceType = options.resourceType;
    if (options.resourceId) where.resourceId = options.resourceId;
    if (options.correlationId) where.correlationId = options.correlationId;

    if (options.startDate || options.endDate) {
      where.timestamp = {};
      if (options.startDate) where.timestamp.gte = new Date(options.startDate);
      if (options.endDate) where.timestamp.lte = new Date(options.endDate);
    }

    if (options.search && options.search.trim() !== '') {
      const term = options.search.trim();
      where.OR = [
        { actionType: { contains: term, mode: 'insensitive' } },
        { actorEmail: { contains: term, mode: 'insensitive' } },
        { resourceType: { contains: term, mode: 'insensitive' } },
        { module: { contains: term, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.AuditLogOrderByWithRelationInput =
      options.sortBy === 'oldest'
        ? { timestamp: 'asc' }
        : options.sortBy === 'action'
        ? { actionType: 'asc' }
        : { timestamp: 'desc' };

    const skip = (options.page - 1) * options.limit;

    const [logs, totalRecords] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: options.limit,
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / options.limit) || 1;

    return {
      data: logs,
      meta: {
        page: options.page,
        limit: options.limit,
        totalRecords,
        totalPages,
      },
    };
  }

  /**
   * Retrieves entire chronological audit history for hash chain verification.
   */
  async findAuditHistoryForVerification(activeOrgId: string) {
    return prisma.auditLog.findMany({
      where: { orgId: activeOrgId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        timestamp: true,
        actorId: true,
        actionType: true,
        resourceType: true,
        resourceId: true,
        changeset: true,
        previousHash: true,
        currentHash: true,
      },
    });
  }

  /**
   * Retrieves records for CSV export.
   */
  async findAuditForExport(activeOrgId: string, startDate?: Date, endDate?: Date, module?: string, actionType?: string) {
    const where: Prisma.AuditLogWhereInput = {
      orgId: activeOrgId,
    };

    if (module) where.module = module;
    if (actionType) where.actionType = actionType;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 5000, // Export cap for performance
      include: {
        actor: { select: { id: true, fullName: true, email: true } },
      },
    });
  }
}
