import { PRRepository, CreatePRRepoData } from '../repositories/pr.repository';
import { PRFilterOptions, PRDiffResponse } from '../types/pr.types';
import { CreatePRInput, UpdatePRInput, SubmitReviewInput } from '../dtos/pr.dto';
import { AuthenticatedUser } from '../../../middleware/authenticate.middleware';
import { ApiError } from '../../../core/utils/api-error';
import { PRStatus, PRReviewStatus } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';
import { PRDiffBuilder } from '../utils/pr-diff.builder';
import { AuditHook } from '../utils/audit-hook.helper';

export class PRService {
  constructor(private readonly prRepo: PRRepository = new PRRepository()) {}

  /**
   * Creates a new Pull Request and stores Version 1 snapshot.
   */
  async createPR(actor: AuthenticatedUser, input: CreatePRInput) {
    const canCreate = ['ORG_ADMIN', 'REVIEWER_APPROVER', 'SUPPORT_MANAGER', 'USER'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!canCreate) {
      throw ApiError.forbidden('You do not have permissions to create Pull Requests', 'INSUFFICIENT_PERMISSIONS');
    }

    if (input.reviewerIds && input.reviewerIds.length > 0) {
      const members = await prisma.orgMember.findMany({
        where: {
          userId: { in: input.reviewerIds },
          orgId: actor.activeOrgId,
        },
      });
      if (members.length !== input.reviewerIds.length) {
        throw ApiError.badRequest('One or more assigned reviewers do not belong to your organization', 'INVALID_REVIEWERS');
      }
    }

    const repoData: CreatePRRepoData = {
      orgId: actor.activeOrgId,
      authorId: actor.userId,
      title: input.title,
      description: input.description,
      sourceBranch: input.sourceBranch,
      targetBranch: input.targetBranch,
      diffContent: input.diffContent,
      requiresNApprovals: input.requiresNApprovals ?? 2,
      reviewerIds: input.reviewerIds,
      labels: input.labels,
      githubPrNumber: input.githubPrNumber,
      githubRepoName: input.githubRepoName,
    };

    const pr = await this.prRepo.createPR(repoData);

    // Trigger Audit Event Hook
    if (pr) {
      AuditHook.logPrEvent({
        actionType: 'CREATE_PR',
        actorId: actor.userId,
        actorEmail: actor.email,
        orgId: actor.activeOrgId,
        resourceId: pr.id,
        changeset: { title: pr.title, status: pr.status },
      });
    }

    return pr;
  }

  /**
   * Retrieves a single PR by ID with tenant scoping.
   */
  async getPRById(actor: AuthenticatedUser, id: string) {
    const pr = await this.prRepo.findPRById(id, actor.activeOrgId);
    if (!pr) {
      throw ApiError.notFound('Pull Request not found', 'PR_NOT_FOUND');
    }

    // Role-based visibility check for USER role
    if (actor.role === 'USER' && !actor.isPlatformSuperAdmin) {
      const isReviewer = pr.reviewers.some((r) => r.reviewerId === actor.userId);
      if (pr.authorId !== actor.userId && !isReviewer) {
        throw ApiError.forbidden('You can only view your own or assigned Pull Requests', 'INSUFFICIENT_PERMISSIONS');
      }
    }

    return pr;
  }

  /**
   * Lists PRs with filtering, search, and pagination.
   */
  async listPRs(actor: AuthenticatedUser, options: PRFilterOptions) {
    if (actor.role === 'USER' && !actor.isPlatformSuperAdmin) {
      options.authorId = actor.userId;
    }
    return this.prRepo.findPRs(actor.activeOrgId, options);
  }

  /**
   * Updates PR details and creates a version snapshot if diffContent/title/description changes.
   */
  async updatePR(actor: AuthenticatedUser, id: string, input: UpdatePRInput) {
    const pr = await this.getPRById(actor, id);

    if (pr.status === PRStatus.MERGED || pr.status === PRStatus.CLOSED) {
      throw ApiError.badRequest('Cannot update a merged or closed Pull Request', 'INVALID_TRANSITION');
    }

    const isAuthorOrAdmin = pr.authorId === actor.userId || actor.role === 'ORG_ADMIN' || actor.isPlatformSuperAdmin;
    if (!isAuthorOrAdmin) {
      throw ApiError.forbidden('Only PR Author or Org Admins can update PR details', 'INSUFFICIENT_PERMISSIONS');
    }

    if (input.diffContent || (input.title && input.title !== pr.title) || (input.description && input.description !== pr.description)) {
      const nextVersionNumber = pr.currentVersionNumber + 1;
      const newTitle = input.title ?? pr.title;
      const newDesc = input.description ?? pr.description;
      const newDiff = input.diffContent ?? pr.versions[0]?.diffContent ?? '';

      await this.prRepo.createPRVersion(id, newTitle, newDesc, newDiff, actor.userId, nextVersionNumber);
    } else {
      const updateData: any = {};
      if (input.title) updateData.title = input.title;
      if (input.description) updateData.description = input.description;
      if (input.status) updateData.status = input.status;

      await this.prRepo.updatePR(id, actor.activeOrgId, updateData);
    }

    return this.getPRById(actor, id);
  }

  /**
   * Changes status of a PR with valid transition checks.
   */
  async changeStatus(actor: AuthenticatedUser, id: string, targetStatus: PRStatus) {
    const pr = await this.getPRById(actor, id);

    if (pr.status === PRStatus.MERGED) {
      throw ApiError.badRequest('Cannot change status of an already merged Pull Request', 'ALREADY_MERGED');
    }

    await this.prRepo.updatePR(id, actor.activeOrgId, { status: targetStatus });

    if (targetStatus === PRStatus.CLOSED) {
      AuditHook.logPrEvent({
        actionType: 'CLOSE_PR',
        actorId: actor.userId,
        actorEmail: actor.email,
        orgId: actor.activeOrgId,
        resourceId: pr.id,
      });
    }

    return this.getPRById(actor, id);
  }

  /**
   * Approves a PR vote.
   */
  async approvePR(actor: AuthenticatedUser, id: string, comment?: string) {
    const pr = await this.getPRById(actor, id);

    if (pr.status === PRStatus.MERGED || pr.status === PRStatus.CLOSED) {
      throw ApiError.badRequest('Cannot approve a merged or closed Pull Request', 'INVALID_TRANSITION');
    }

    if (pr.authorId === actor.userId && !actor.isPlatformSuperAdmin && actor.role !== 'ORG_ADMIN') {
      throw ApiError.forbidden('Authors cannot approve their own Pull Requests', 'CANNOT_REVIEW_OWN_PR');
    }

    await this.prRepo.upsertReviewerVote(id, actor.userId, PRReviewStatus.APPROVED, comment);

    AuditHook.logPrEvent({
      actionType: 'APPROVE_PR',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: pr.id,
      changeset: { comment },
    });

    const updatedPr = await this.getPRById(actor, id);
    const approvedCount = updatedPr.reviewers.filter((r) => r.status === 'APPROVED').length;

    if (approvedCount >= updatedPr.requiresNApprovals && updatedPr.status !== PRStatus.APPROVED) {
      await this.prRepo.updatePR(id, actor.activeOrgId, { status: PRStatus.APPROVED });
    }

    return this.getPRById(actor, id);
  }

  /**
   * Requests changes on a PR vote.
   */
  async requestChangesPR(actor: AuthenticatedUser, id: string, comment: string) {
    const pr = await this.getPRById(actor, id);

    if (pr.status === PRStatus.MERGED || pr.status === PRStatus.CLOSED) {
      throw ApiError.badRequest('Cannot request changes on a merged or closed Pull Request', 'INVALID_TRANSITION');
    }

    await this.prRepo.upsertReviewerVote(id, actor.userId, PRReviewStatus.CHANGES_REQUESTED, comment);

    AuditHook.logPrEvent({
      actionType: 'REQUEST_CHANGES_PR',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: pr.id,
      changeset: { comment },
    });

    await this.prRepo.updatePR(id, actor.activeOrgId, { status: PRStatus.CHANGES_REQUESTED });
    return this.getPRById(actor, id);
  }

  /**
   * Merges a PR. Validates PR is APPROVED.
   */
  async mergePR(actor: AuthenticatedUser, id: string) {
    const pr = await this.getPRById(actor, id);

    if (pr.status === PRStatus.MERGED) {
      throw ApiError.badRequest('Pull Request is already merged', 'ALREADY_MERGED');
    }

    if (pr.status === PRStatus.CLOSED) {
      throw ApiError.badRequest('Cannot merge a closed Pull Request', 'INVALID_TRANSITION');
    }

    // Require APPROVED status before merging
    if (pr.status !== PRStatus.APPROVED && !actor.isPlatformSuperAdmin && actor.role !== 'ORG_ADMIN') {
      throw ApiError.badRequest(`Pull Request must be APPROVED before merging. Current status: ${pr.status}`, 'PR_NOT_APPROVED');
    }

    await this.prRepo.mergePR(id, actor.activeOrgId, actor.userId);

    AuditHook.logPrEvent({
      actionType: 'MERGE_PR',
      actorId: actor.userId,
      actorEmail: actor.email,
      orgId: actor.activeOrgId,
      resourceId: pr.id,
    });

    return this.getPRById(actor, id);
  }

  /**
   * Soft deletes a Pull Request.
   */
  async deletePR(actor: AuthenticatedUser, id: string) {
    const pr = await this.getPRById(actor, id);

    const isAuthorOrAdmin = pr.authorId === actor.userId || actor.role === 'ORG_ADMIN' || actor.isPlatformSuperAdmin;
    if (!isAuthorOrAdmin) {
      throw ApiError.forbidden('Only PR Author or Org Admins can delete Pull Requests', 'INSUFFICIENT_PERMISSIONS');
    }

    await this.prRepo.softDeletePR(id, actor.activeOrgId);
    return { message: 'Pull Request deleted successfully' };
  }

  /**
   * Assigns reviewers to a PR.
   */
  async assignReviewers(actor: AuthenticatedUser, id: string, reviewerIds: string[]) {
    const pr = await this.getPRById(actor, id);

    // Check duplicate reviewer assignment
    const existingReviewerIds = pr.reviewers.map((r) => r.reviewerId);
    const hasAlreadyAssigned = reviewerIds.some((id) => existingReviewerIds.includes(id));
    if (hasAlreadyAssigned) {
      throw ApiError.badRequest('One or more reviewers are already assigned to this Pull Request', 'REVIEWER_ALREADY_ASSIGNED');
    }

    const members = await prisma.orgMember.findMany({
      where: {
        userId: { in: reviewerIds },
        orgId: actor.activeOrgId,
      },
    });
    if (members.length !== reviewerIds.length) {
      throw ApiError.badRequest('One or more reviewers do not belong to your organization', 'INVALID_REVIEWERS');
    }

    await this.prRepo.assignReviewers(id, reviewerIds);
    return this.getPRById(actor, id);
  }

  /**
   * Retrieves version history snapshots for a PR.
   */
  async getPRVersions(actor: AuthenticatedUser, id: string) {
    await this.getPRById(actor, id);
    return this.prRepo.findPRVersions(id);
  }

  /**
   * Computes a unified diff between two PR versions.
   */
  async getPRVersionDiff(actor: AuthenticatedUser, id: string, toVersionNumber: number, fromVersionNumber?: number): Promise<PRDiffResponse> {
    await this.getPRById(actor, id);

    const targetVersion = await this.prRepo.findPRVersionByNumber(id, toVersionNumber);
    if (!targetVersion) {
      throw ApiError.notFound(`Version ${toVersionNumber} not found`, 'VERSION_NOT_FOUND');
    }

    const sourceVerNum = fromVersionNumber ?? Math.max(1, toVersionNumber - 1);
    const sourceVersion = await this.prRepo.findPRVersionByNumber(id, sourceVerNum);

    const sourceContent = sourceVersion ? sourceVersion.diffContent : '';
    const diffContent = PRDiffBuilder.generateDiff(sourceContent, targetVersion.diffContent, sourceVerNum, toVersionNumber);

    return {
      prId: id,
      fromVersion: sourceVerNum,
      toVersion: toVersionNumber,
      diffContent,
      fromTitle: sourceVersion?.title,
      toTitle: targetVersion.title,
    };
  }

  /**
   * Adds a discussion comment to a PR.
   */
  async addComment(actor: AuthenticatedUser, prId: string, content: string) {
    await this.getPRById(actor, prId);
    return this.prRepo.createPRComment(prId, actor.userId, actor.activeOrgId, content);
  }

  /**
   * Lists comments for a PR.
   */
  async listComments(actor: AuthenticatedUser, prId: string) {
    await this.getPRById(actor, prId);
    return this.prRepo.findPRCommentsByPRId(prId);
  }

  /**
   * Updates a PR comment.
   */
  async updateComment(actor: AuthenticatedUser, commentId: string, content: string) {
    const comment = await this.prRepo.findPRCommentById(commentId);
    if (!comment || comment.pr.orgId !== actor.activeOrgId) {
      throw ApiError.notFound('PR Comment not found', 'COMMENT_NOT_FOUND');
    }

    const isAuthorOrAdmin = comment.authorId === actor.userId || actor.role === 'ORG_ADMIN' || actor.isPlatformSuperAdmin;
    if (!isAuthorOrAdmin) {
      throw ApiError.forbidden('You can only update your own comments', 'INSUFFICIENT_PERMISSIONS');
    }

    return this.prRepo.updatePRComment(commentId, content);
  }

  /**
   * Soft deletes a PR comment.
   */
  async deleteComment(actor: AuthenticatedUser, commentId: string) {
    const comment = await this.prRepo.findPRCommentById(commentId);
    if (!comment || comment.pr.orgId !== actor.activeOrgId) {
      throw ApiError.notFound('PR Comment not found', 'COMMENT_NOT_FOUND');
    }

    const isAuthorOrAdmin = comment.authorId === actor.userId || actor.role === 'ORG_ADMIN' || actor.isPlatformSuperAdmin;
    if (!isAuthorOrAdmin) {
      throw ApiError.forbidden('You can only delete your own comments', 'INSUFFICIENT_PERMISSIONS');
    }

    await this.prRepo.softDeletePRComment(commentId);
    return { message: 'PR Comment deleted successfully' };
  }
}
