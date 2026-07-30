import { DigestInterval, Prisma } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';

export interface CreateDigestRepoData {
  userId: string;
  orgId: string;
  summaryText: string;
  metricsSnapshot: any;
  intervalType: DigestInterval;
}

export class AIDigestRepository {
  /**
   * Saves a new AI digest snapshot record.
   */
  async createDigest(data: CreateDigestRepoData) {
    return prisma.aIDigest.create({
      data: {
        userId: data.userId,
        orgId: data.orgId,
        summaryText: data.summaryText,
        metricsSnapshot: data.metricsSnapshot,
        intervalType: data.intervalType,
      },
    });
  }

  /**
   * Retrieves a digest by ID scoped to active organization and user.
   */
  async findDigestById(id: string, activeOrgId: string, userId: string) {
    return prisma.aIDigest.findFirst({
      where: {
        id,
        orgId: activeOrgId,
        userId,
      },
    });
  }

  /**
   * Lists digests for user with pagination.
   */
  async findDigestsForUser(userId: string, activeOrgId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [digests, totalRecords] = await Promise.all([
      prisma.aIDigest.findMany({
        where: {
          userId,
          orgId: activeOrgId,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aIDigest.count({
        where: {
          userId,
          orgId: activeOrgId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      data: digests,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    };
  }
}
