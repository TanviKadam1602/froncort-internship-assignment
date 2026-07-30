import express, { Router } from 'express';
import { AIDigestController } from './controllers/ai-digest.controller';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { generateDigestSchema, getDigestByIdSchema, listDigestsQuerySchema } from './dtos/ai-digest.dto';

export const aiDigestRouter: Router = express.Router();
const controller = new AIDigestController();

// Global Middlewares
aiDigestRouter.use(authenticateMiddleware);
aiDigestRouter.use(tenantContextMiddleware);

/**
 * AI Progress Digest Endpoints
 */
aiDigestRouter.post(
  '/generate',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'REVIEWER_APPROVER', 'SUPPORT_AGENT']),
  validateRequest(generateDigestSchema),
  controller.generateDigest
);

aiDigestRouter.post(
  '/digest',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'REVIEWER_APPROVER', 'SUPPORT_AGENT']),
  validateRequest(generateDigestSchema),
  controller.generateDigest
);

aiDigestRouter.post(
  '/digest/:id/regenerate',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'REVIEWER_APPROVER', 'SUPPORT_AGENT']),
  validateRequest(getDigestByIdSchema),
  controller.regenerateDigest
);

aiDigestRouter.get(
  '/digest',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'REVIEWER_APPROVER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(listDigestsQuerySchema),
  controller.listDigests
);

aiDigestRouter.get(
  '/digests',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'REVIEWER_APPROVER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(listDigestsQuerySchema),
  controller.listDigests
);

aiDigestRouter.get(
  '/digest/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'REVIEWER_APPROVER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(getDigestByIdSchema),
  controller.getDigestById
);

aiDigestRouter.get(
  '/digests/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'REVIEWER_APPROVER', 'SUPPORT_AGENT', 'USER']),
  validateRequest(getDigestByIdSchema),
  controller.getDigestById
);

/**
 * BullMQ Job Status Endpoints
 */
aiDigestRouter.get(
  '/jobs',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  controller.getJobs
);

aiDigestRouter.get(
  '/jobs/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  controller.getJobById
);
