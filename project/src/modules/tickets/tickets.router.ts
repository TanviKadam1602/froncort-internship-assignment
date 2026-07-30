import express, { Router } from 'express';
import { TicketController } from './controllers/ticket.controller';
import { authenticateMiddleware } from '../../middleware/authenticate.middleware';
import { tenantContextMiddleware } from '../../middleware/tenant-context.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  createTicketSchema,
  updateTicketSchema,
  assignTicketSchema,
  updateStatusSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  createAttachmentSchema,
  getTicketByIdSchema,
  listTicketsQuerySchema,
} from './dtos/ticket.dto';

export const ticketsRouter: Router = express.Router();
const controller = new TicketController();

// Global Middleware Pipeline for all Support Hub Ticket Endpoints
ticketsRouter.use(authenticateMiddleware);
ticketsRouter.use(tenantContextMiddleware);

/**
 * Ticket List & Creation Routes
 */
ticketsRouter.post(
  '/',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(createTicketSchema),
  controller.createTicket
);

ticketsRouter.get(
  '/',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(listTicketsQuerySchema),
  controller.listTickets
);

/**
 * Comment Management Routes (Targeting commentId)
 */
ticketsRouter.patch(
  '/comments/:commentId',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(updateCommentSchema),
  controller.updateComment
);

ticketsRouter.delete(
  '/comments/:commentId',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(deleteCommentSchema),
  controller.deleteComment
);

/**
 * Single Ticket Detail & Workflow Routes
 */
ticketsRouter.get(
  '/:id',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(getTicketByIdSchema),
  controller.getTicketById
);

ticketsRouter.patch(
  '/:id',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(updateTicketSchema),
  controller.updateTicket
);

ticketsRouter.delete(
  '/:id',
  requireRoles(['SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(getTicketByIdSchema),
  controller.deleteTicket
);

ticketsRouter.patch(
  '/:id/status',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(updateStatusSchema),
  controller.changeStatus
);

ticketsRouter.patch(
  '/:id/assign',
  requireRoles(['SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(assignTicketSchema),
  controller.assignTicket
);

/**
 * Ticket Comments & Attachments Sub-Routes
 */
ticketsRouter.post(
  '/:id/comments',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(createCommentSchema),
  controller.addComment
);

ticketsRouter.get(
  '/:id/comments',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(getTicketByIdSchema),
  controller.listComments
);

ticketsRouter.post(
  '/:id/attachments',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(createAttachmentSchema),
  controller.addAttachment
);

ticketsRouter.get(
  '/:id/attachments',
  requireRoles(['USER', 'SUPPORT_AGENT', 'SUPPORT_MANAGER', 'ORG_ADMIN']),
  validateRequest(getTicketByIdSchema),
  controller.listAttachments
);
