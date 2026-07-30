import { TicketRepository, CreateTicketRepoData } from '../repositories/ticket.repository';
import { TicketFilterOptions } from '../types/ticket.types';
import { CreateTicketInput, UpdateTicketInput, CreateCommentInput, CreateAttachmentInput } from '../dtos/ticket.dto';
import { AuthenticatedUser } from '../../../middleware/authenticate.middleware';
import { ApiError } from '../../../core/utils/api-error';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';

export class TicketService {
  constructor(private readonly ticketRepo: TicketRepository = new TicketRepository()) {}

  /**
   * Creates a support ticket in the actor's active organization.
   */
  async createTicket(actor: AuthenticatedUser, input: CreateTicketInput) {
    // Verify assignee if provided
    if (input.assigneeId) {
      const assigneeMembership = await prisma.orgMember.findUnique({
        where: {
          userId_orgId: {
            userId: input.assigneeId,
            orgId: actor.activeOrgId,
          },
        },
      });
      if (!assigneeMembership) {
        throw ApiError.badRequest('Assignee does not belong to the active organization', 'INVALID_ASSIGNEE');
      }
    }

    const repoData: CreateTicketRepoData = {
      orgId: actor.activeOrgId,
      authorId: actor.userId,
      title: input.title,
      description: input.description,
      priority: input.priority ?? TicketPriority.MEDIUM,
      category: input.category ?? 'GENERAL',
      assigneeId: input.assigneeId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      tags: input.tags,
    };

    return this.ticketRepo.createTicket(repoData);
  }

  /**
   * Retrieves a single ticket by ID with tenant isolation & RBAC checks.
   */
  async getTicketById(actor: AuthenticatedUser, id: string) {
    const ticket = await this.ticketRepo.findTicketById(id, actor.activeOrgId);
    if (!ticket) {
      throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
    }

    // Role-based visibility check for standard USER role
    if (actor.role === 'USER' && !actor.isPlatformSuperAdmin) {
      if (ticket.authorId !== actor.userId && ticket.assigneeId !== actor.userId) {
        throw ApiError.forbidden('You can only view your own or assigned tickets', 'INSUFFICIENT_PERMISSIONS');
      }
    }

    return ticket;
  }

  /**
   * Retrieves a paginated list of tickets.
   * Scopes standard USER role to their own created/assigned tickets.
   */
  async listTickets(actor: AuthenticatedUser, options: TicketFilterOptions) {
    // Role-Based Filtering: Standard USER can only list their own tickets
    if (actor.role === 'USER' && !actor.isPlatformSuperAdmin) {
      options.authorId = actor.userId;
    }

    return this.ticketRepo.findTickets(actor.activeOrgId, options);
  }

  /**
   * Updates a ticket.
   */
  async updateTicket(actor: AuthenticatedUser, id: string, input: UpdateTicketInput) {
    const ticket = await this.ticketRepo.findTicketById(id, actor.activeOrgId);
    if (!ticket) {
      throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
    }

    // RBAC check: Only MANAGER, ADMIN, or the ticket Author can edit ticket details
    const isManagerOrAdmin = ['ORG_ADMIN', 'SUPPORT_MANAGER'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!isManagerOrAdmin && ticket.authorId !== actor.userId) {
      throw ApiError.forbidden('Only ticket author or managers can update ticket details', 'INSUFFICIENT_PERMISSIONS');
    }

    // Verify assignee if changing
    if (input.assigneeId) {
      const assigneeMembership = await prisma.orgMember.findUnique({
        where: {
          userId_orgId: {
            userId: input.assigneeId,
            orgId: actor.activeOrgId,
          },
        },
      });
      if (!assigneeMembership) {
        throw ApiError.badRequest('Assignee does not belong to the active organization', 'INVALID_ASSIGNEE');
      }
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.assigneeId !== undefined) updateData.assigneeId = input.assigneeId;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.tags !== undefined) updateData.tags = input.tags;

    await this.ticketRepo.updateTicket(id, actor.activeOrgId, updateData);
    return this.getTicketById(actor, id);
  }

  /**
   * Soft deletes a ticket.
   */
  async deleteTicket(actor: AuthenticatedUser, id: string) {
    const ticket = await this.ticketRepo.findTicketById(id, actor.activeOrgId);
    if (!ticket) {
      throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
    }

    // RBAC check: Only MANAGER or ADMIN can delete tickets
    const isManagerOrAdmin = ['ORG_ADMIN', 'SUPPORT_MANAGER'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!isManagerOrAdmin) {
      throw ApiError.forbidden('Only Managers or Admins can delete support tickets', 'INSUFFICIENT_PERMISSIONS');
    }

    await this.ticketRepo.softDeleteTicket(id, actor.activeOrgId);
    return { message: 'Ticket soft-deleted successfully' };
  }

  /**
   * Assigns a ticket to a support agent or user.
   */
  async assignTicket(actor: AuthenticatedUser, id: string, assigneeId: string) {
    const ticket = await this.ticketRepo.findTicketById(id, actor.activeOrgId);
    if (!ticket) {
      throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
    }

    // RBAC check: SUPPORT_MANAGER, ORG_ADMIN, or SUPPORT_AGENT can assign tickets
    const canAssign = ['ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!canAssign) {
      throw ApiError.forbidden('You do not have permissions to assign tickets', 'INSUFFICIENT_PERMISSIONS');
    }

    // Verify target assignee belongs to tenant
    const assigneeMembership = await prisma.orgMember.findUnique({
      where: {
        userId_orgId: {
          userId: assigneeId,
          orgId: actor.activeOrgId,
        },
      },
    });
    if (!assigneeMembership) {
      throw ApiError.badRequest('Target assignee does not belong to your organization', 'INVALID_ASSIGNEE');
    }

    await this.ticketRepo.assignTicket(id, actor.activeOrgId, assigneeId);
    return this.getTicketById(actor, id);
  }

  /**
   * Changes status of a ticket.
   */
  async changeStatus(actor: AuthenticatedUser, id: string, status: TicketStatus) {
    const ticket = await this.ticketRepo.findTicketById(id, actor.activeOrgId);
    if (!ticket) {
      throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
    }

    // RBAC check: Agents, Managers, Admins, or Ticket Author can change status
    const canChangeStatus =
      ['ORG_ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT'].includes(actor.role) ||
      ticket.authorId === actor.userId ||
      actor.isPlatformSuperAdmin;

    if (!canChangeStatus) {
      throw ApiError.forbidden('You do not have permissions to change status on this ticket', 'INSUFFICIENT_PERMISSIONS');
    }

    await this.ticketRepo.updateTicketStatus(id, actor.activeOrgId, status);
    return this.getTicketById(actor, id);
  }

  /**
   * Adds a comment to a ticket.
   */
  async addComment(actor: AuthenticatedUser, ticketId: string, input: CreateCommentInput) {
    const ticket = await this.getTicketById(actor, ticketId);
    if (!ticket) {
      throw ApiError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
    }

    return this.ticketRepo.createComment({
      ticketId,
      authorId: actor.userId,
      authorOrgId: actor.activeOrgId,
      content: input.content,
    });
  }

  /**
   * Lists comments for a ticket.
   */
  async listComments(actor: AuthenticatedUser, ticketId: string) {
    await this.getTicketById(actor, ticketId);
    return this.ticketRepo.findCommentsByTicketId(ticketId, actor.activeOrgId);
  }

  /**
   * Updates a comment.
   */
  async updateComment(actor: AuthenticatedUser, commentId: string, content: string) {
    const comment = await this.ticketRepo.findCommentById(commentId);
    if (!comment || comment.ticket.orgId !== actor.activeOrgId) {
      throw ApiError.notFound('Comment not found', 'COMMENT_NOT_FOUND');
    }

    // Only Author or Admin/Manager can edit comments
    const isManagerOrAdmin = ['ORG_ADMIN', 'SUPPORT_MANAGER'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!isManagerOrAdmin && comment.authorId !== actor.userId) {
      throw ApiError.forbidden('You can only edit your own comments', 'INSUFFICIENT_PERMISSIONS');
    }

    return this.ticketRepo.updateComment(commentId, content);
  }

  /**
   * Soft deletes a comment.
   */
  async deleteComment(actor: AuthenticatedUser, commentId: string) {
    const comment = await this.ticketRepo.findCommentById(commentId);
    if (!comment || comment.ticket.orgId !== actor.activeOrgId) {
      throw ApiError.notFound('Comment not found', 'COMMENT_NOT_FOUND');
    }

    // Only Author or Admin/Manager can delete comments
    const isManagerOrAdmin = ['ORG_ADMIN', 'SUPPORT_MANAGER'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!isManagerOrAdmin && comment.authorId !== actor.userId) {
      throw ApiError.forbidden('You can only delete your own comments', 'INSUFFICIENT_PERMISSIONS');
    }

    await this.ticketRepo.softDeleteComment(commentId);
    return { message: 'Comment deleted successfully' };
  }

  /**
   * Uploads file attachment metadata for a ticket.
   */
  async addAttachment(actor: AuthenticatedUser, ticketId: string, input: CreateAttachmentInput) {
    await this.getTicketById(actor, ticketId);

    return this.ticketRepo.createAttachment({
      ticketId,
      uploaderId: actor.userId,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
    });
  }

  /**
   * Lists file attachments for a ticket.
   */
  async listAttachments(actor: AuthenticatedUser, ticketId: string) {
    await this.getTicketById(actor, ticketId);
    return this.ticketRepo.findAttachmentsByTicketId(ticketId, actor.activeOrgId);
  }
}
