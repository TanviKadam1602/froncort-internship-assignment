import express, { Router } from 'express';
import { PRController } from './controllers/pr.controller';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createPRSchema,
  updatePRSchema,
  updatePRStatusSchema,
  approvePRSchema,
  requestChangesPRSchema,
  mergePRSchema,
  assignReviewersSchema,
  createPRCommentSchema,
  updatePRCommentSchema,
  deletePRCommentSchema,
  getPRByIdSchema,
  listPRsQuerySchema,
  getPRDiffSchema,
} from './dtos/pr.dto';

export const prsRouter: Router = express.Router();
const controller = new PRController();

// Global Middlewares for PR Module
prsRouter.use(authenticateMiddleware);
prsRouter.use(tenantContextMiddleware);

/**
 * PR List & Creation Routes
 */
prsRouter.post(
  '/',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'USER']),
  validateRequest(createPRSchema),
  controller.createPR
);

prsRouter.get(
  '/',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(listPRsQuerySchema),
  controller.listPRs
);

/**
 * Comment Direct Operations (commentId)
 */
prsRouter.patch(
  '/comments/:commentId',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(updatePRCommentSchema),
  controller.updateComment
);

prsRouter.delete(
  '/comments/:commentId',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(deletePRCommentSchema),
  controller.deleteComment
);

/**
 * Single PR Detail & General Update
 */
prsRouter.get(
  '/:id',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(getPRByIdSchema),
  controller.getPRById
);

prsRouter.patch(
  '/:id',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(updatePRSchema),
  controller.updatePR
);

prsRouter.delete(
  '/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(getPRByIdSchema),
  controller.deletePR
);

/**
 * PR Workflow Actions (Status, Merge, Approve, Request Changes, Reviewers)
 */
prsRouter.patch(
  '/:id/status',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(updatePRStatusSchema),
  controller.changeStatus
);

prsRouter.patch(
  '/:id/merge',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(mergePRSchema),
  controller.mergePR
);

prsRouter.patch(
  '/:id/approve',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN']),
  validateRequest(approvePRSchema),
  controller.approvePR
);

prsRouter.patch(
  '/:id/request-changes',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN']),
  validateRequest(requestChangesPRSchema),
  controller.requestChangesPR
);

prsRouter.patch(
  '/:id/reviewers',
  requireRoles(['SUPPORT_MANAGER', 'ORG_ADMIN', 'REVIEWER_APPROVER']),
  validateRequest(assignReviewersSchema),
  controller.assignReviewers
);

/**
 * Version History & Version Diff View Routes
 */
prsRouter.get(
  '/:id/versions',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(getPRByIdSchema),
  controller.getPRVersions
);

prsRouter.get(
  '/:id/versions/:versionNumber/diff',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(getPRDiffSchema),
  controller.getPRVersionDiff
);

/**
 * PR Discussion Comments Sub-Routes
 */
prsRouter.post(
  '/:id/comments',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(createPRCommentSchema),
  controller.addComment
);

prsRouter.get(
  '/:id/comments',
  requireRoles(['REVIEWER_APPROVER', 'ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(getPRByIdSchema),
  controller.listComments
);
