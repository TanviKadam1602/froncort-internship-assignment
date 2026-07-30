import express, { Router } from 'express';
import { CrossOrgController } from './controllers/cross-org.controller';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createConnectionSchema,
  respondConnectionSchema,
  shareResourceSchema,
  updatePermissionSchema,
  getSharedResourceByIdSchema,
  revokeSharedResourceSchema,
} from './dtos/cross-org.dto';

export const crossOrgRouter: Router = express.Router();
const controller = new CrossOrgController();

// Global Middlewares for Cross-Org Module
crossOrgRouter.use(authenticateMiddleware);
crossOrgRouter.use(tenantContextMiddleware);

/**
 * Organization Partner Handshake Routes
 */
crossOrgRouter.post(
  '/connections',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(createConnectionSchema),
  controller.requestConnection
);

crossOrgRouter.get(
  '/connections',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'REVIEWER_APPROVER', 'USER']),
  controller.listConnections
);

crossOrgRouter.patch(
  '/connections/:id/accept',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  controller.acceptConnection
);

crossOrgRouter.patch(
  '/connections/:id/reject',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  controller.rejectConnection
);

crossOrgRouter.patch(
  '/connections/:id/cancel',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  controller.cancelConnection
);

crossOrgRouter.patch(
  '/connections/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(respondConnectionSchema),
  controller.respondConnection
);

crossOrgRouter.delete(
  '/connections/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  controller.deleteConnection
);

/**
 * Cross-Organization Resource Sharing Routes
 */
crossOrgRouter.post(
  '/resources',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'REVIEWER_APPROVER']),
  validateRequest(shareResourceSchema),
  controller.shareResource
);

crossOrgRouter.get(
  '/resources',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'REVIEWER_APPROVER', 'USER']),
  controller.listSharedResources
);

crossOrgRouter.get(
  '/resources/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'REVIEWER_APPROVER', 'USER']),
  validateRequest(getSharedResourceByIdSchema),
  controller.getSharedResourceById
);

crossOrgRouter.patch(
  '/resources/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(updatePermissionSchema),
  controller.updateSharedResourcePermission
);

crossOrgRouter.delete(
  '/resources/:id',
  requireRoles(['ORG_ADMIN', 'SUPPORT_MANAGER']),
  validateRequest(revokeSharedResourceSchema),
  controller.revokeSharedResource
);
