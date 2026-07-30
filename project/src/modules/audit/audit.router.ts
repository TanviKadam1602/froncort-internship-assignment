import express, { Router } from 'express';
import { AuditController } from './controllers/audit.controller';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  listAuditQuerySchema,
  getAuditByIdSchema,
  exportAuditSchema,
} from './dtos/audit.dto';

export const auditRouter: Router = express.Router();
const controller = new AuditController();

// Global Middlewares for Audit Module
auditRouter.use(authenticateMiddleware);
auditRouter.use(tenantContextMiddleware);

/**
 * Audit Log Search & List Route
 */
auditRouter.get(
  '/',
  requireRoles(['SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(listAuditQuerySchema),
  controller.listAuditLogs
);

/**
 * Visual Audit Timeline Route
 */
auditRouter.get(
  '/timeline',
  requireRoles(['SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(listAuditQuerySchema),
  controller.getAuditTimeline
);

/**
 * Downloadable CSV Export Route
 */
auditRouter.get(
  '/export',
  requireRoles(['SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(exportAuditSchema),
  controller.exportAuditCSV
);

/**
 * Cryptographic Hash Chain Verification Route
 */
auditRouter.get(
  '/verify',
  requireRoles(['SUPPORT_MANAGER', 'ORG_ADMIN']),
  controller.verifyHashChain
);

/**
 * Single Audit Log Entry Detail Route
 */
auditRouter.get(
  '/:id',
  requireRoles(['SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(getAuditByIdSchema),
  controller.getAuditById
);
