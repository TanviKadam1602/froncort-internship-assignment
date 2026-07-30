import { PRStatus, PRReviewStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';
import { PRFilterOptions } from '../types/pr.types';

export interface CreatePRRepoData {
  orgId: string;
  authorId: string;
  title: string;
  description: string;
  sourceBranch?: string;
  targetBranch?: string;
  diffContent: string;
  requiresNApprovals: number;
  reviewerIds?: string[];
  labels?: string[];
  githubPrNumber?: number;
  githubRepoName?: string;
}

export class PRRepository {
  /**
   * Generates the next sequential PR number within the organization.
   */
  private async getNextPRNumber(orgId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const db = tx ?? prisma;
    const aggregate = await db.pullRequest.aggregate({
      where: { orgId },
      _max: { prNumber: true },
    });
    return (aggregate._max.prNumber ?? 0) + 1;
  }

  /**
   * Creates a new Pull Request along with Version 1 and initial Reviewers in a single transaction.
   */
  async createPR(data: CreatePRRepoData) {
    return prisma.$transaction(async (tx) => {
      const prNumber = await this.getNextPRNumber(data.orgId, tx);

      // 1. Create PullRequest Record
      const pr = await tx.pullRequest.create({
        data: {
          prNumber,
          orgId: data.orgId,
          authorId: data.authorId,
          title: data.title,
          description: data.description,
          sourceBranch: data.sourceBranch ?? 'feature/branch',
          targetBranch: data.targetBranch ?? 'main',
          status: PRStatus.DRAFT,
          labels: data.labels ? (data.labels as any) : [],
          requiresNApprovals: data.requiresNApprovals,
          currentVersionNumber: 1,
          githubPrNumber: data.githubPrNumber,
          githubRepoName: data.githubRepoName,
        },
      });

      // 2. Create PRVersion 1
      await tx.pRVersion.create({
        data: {
          prId: pr.id,
          versionNumber: 1,
          title: data.title,
          description: data.description,
          diffContent: data.diffContent,
          createdById: data.authorId,
        },
      });

      // 3. Assign Initial Reviewers if provided
      if (data.reviewerIds && data.reviewerIds.length > 0) {
        const reviewerRecords = data.reviewerIds.map((reviewerId) => ({
          prId: pr.id,
          reviewerId,
          status: PRReviewStatus.PENDING,
        }));
        await tx.pRReviewer.createMany({
          data: reviewerRecords,
          skipDuplicates: true,
        });
      }

      return this.findPRById(pr.id, data.orgId, tx);
    });
  }

  /**
   * Retrieves a single PR by ID with tenant isolation (activeOrgId).
   */
  async findPRById(id: string, activeOrgId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? prisma;
    return db.pullRequest.findFirst({
      where: {
        id,
        orgId: activeOrgId,
        deletedAt: null,
      },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        mergedBy: {
          select: { id: true, fullName: true, email: true },
        },
        reviewers: {
          include: {
            reviewer: {
              select: { id: true, fullName: true, email: true, avatarUrl: true },
            },
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            createdBy: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, fullName: true, email: true, avatarUrl: true },
            },
            authorOrg: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }

  /**
   * Lists PRs with filtering, search, and pagination.
   */
  async findPRs(activeOrgId: string, options: PRFilterOptions) {
    const where: Prisma.PullRequestWhereInput = {
      orgId: activeOrgId,
      deletedAt: null,
    };

    if (options.status) {
      where.status = options.status;
    }

    if (options.authorId) {
      where.authorId = options.authorId;
    }

    if (options.reviewerId) {
      where.reviewers = {
        some: {
          reviewerId: options.reviewerId,
        },
      };
    }

    if (options.search && options.search.trim() !== '') {
      const term = options.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.PullRequestOrderByWithRelationInput =
      options.sortBy === 'oldest'
        ? { createdAt: 'asc' }
        : options.sortBy === 'updatedAt'
        ? { updatedAt: 'desc' }
        : { createdAt: 'desc' };

    const skip = (options.page - 1) * options.limit;

    const [prs, totalRecords] = await Promise.all([
      prisma.pullRequest.findMany({
        where,
        orderBy,
        skip,
        take: options.limit,
        include: {
          author: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
          reviewers: {
            include: {
              reviewer: { select: { id: true, fullName: true, email: true } },
            },
          },
          _count: {
            select: { comments: true, versions: true },
          },
        },
      }),
      prisma.pullRequest.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / options.limit) || 1;

    return {
      data: prs,
      meta: {
        page: options.page,
        limit: options.limit,
        totalRecords,
        totalPages,
      },
    };
  }

  /**
   * Updates basic PR fields.
   */
  async updatePR(id: string, activeOrgId: string, data: Prisma.PullRequestUpdateInput) {
    return prisma.pullRequest.updateMany({
      where: { id, orgId: activeOrgId, deletedAt: null },
      data,
    });
  }

  /**
   * Merges a PR by updating status to MERGED and recording mergedById & mergedAt.
   */
  async mergePR(id: string, activeOrgId: string, mergedById: string) {
    return prisma.pullRequest.updateMany({
      where: { id, orgId: activeOrgId, deletedAt: null },
      data: {
        status: PRStatus.MERGED,
        mergedById,
        mergedAt: new Date(),
      },
    });
  }

  /**
   * Soft deletes a PR.
   */
  async softDeletePR(id: string, activeOrgId: string) {
    return prisma.pullRequest.updateMany({
      where: { id, orgId: activeOrgId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Assigns new reviewers to a PR.
   */
  async assignReviewers(prId: string, reviewerIds: string[]) {
    const records = reviewerIds.map((reviewerId) => ({
      prId,
      reviewerId,
      status: PRReviewStatus.PENDING,
    }));

    return prisma.pRReviewer.createMany({
      data: records,
      skipDuplicates: true,
    });
  }

  /**
   * Records or updates a reviewer's vote (APPROVED, CHANGES_REQUESTED, REJECTED).
   */
  async upsertReviewerVote(prId: string, reviewerId: string, status: PRReviewStatus, comment?: string) {
    return prisma.pRReviewer.upsert({
      where: {
        prId_reviewerId: { prId, reviewerId },
      },
      update: {
        status,
        comment,
      },
      create: {
        prId,
        reviewerId,
        status,
        comment,
      },
    });
  }

  /**
   * Creates a new version snapshot for a PR and updates currentVersionNumber.
   */
  async createPRVersion(
    prId: string,
    title: string,
    description: string,
    diffContent: string,
    createdById: string,
    newVersionNumber: number
  ) {
    return prisma.$transaction(async (tx) => {
      const version = await tx.pRVersion.create({
        data: {
          prId,
          versionNumber: newVersionNumber,
          title,
          description,
          diffContent,
          createdById,
        },
      });

      await tx.pullRequest.update({
        where: { id: prId },
        data: {
          currentVersionNumber: newVersionNumber,
          title,
          description,
        },
      });

      return version;
    });
  }

  /**
   * Lists version history snapshots for a PR.
   */
  async findPRVersions(prId: string) {
    return prisma.pRVersion.findMany({
      where: { prId },
      orderBy: { versionNumber: 'desc' },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  /**
   * Finds a specific version snapshot by version number.
   */
  async findPRVersionByNumber(prId: string, versionNumber: number) {
    return prisma.pRVersion.findUnique({
      where: {
        prId_versionNumber: { prId, versionNumber },
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  /**
   * Adds a comment to a PR.
   */
  async createPRComment(prId: string, authorId: string, authorOrgId: string, content: string) {
    return prisma.pRComment.create({
      data: {
        prId,
        authorId,
        authorOrgId,
        content,
      },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        authorOrg: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  /**
   * Finds a PR comment by ID.
   */
  async findPRCommentById(commentId: string) {
    return prisma.pRComment.findFirst({
      where: { id: commentId, deletedAt: null },
      include: {
        pr: { select: { id: true, orgId: true } },
      },
    });
  }

  /**
   * Lists comments for a PR.
   */
  async findPRCommentsByPRId(prId: string) {
    return prisma.pRComment.findMany({
      where: { prId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        authorOrg: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  /**
   * Updates PR comment content.
   */
  async updatePRComment(commentId: string, content: string) {
    return prisma.pRComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  /**
   * Soft deletes a PR comment.
   */
  async softDeletePRComment(commentId: string) {
    return prisma.pRComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }
}
