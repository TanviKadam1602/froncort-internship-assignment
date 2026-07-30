import { TicketStatus, TicketPriority, Prisma } from '@prisma/client';
import { prisma } from '../../../core/database/prisma.client';
import { TicketFilterOptions, PaginatedResult } from '../types/ticket.types';
import { TicketFilterBuilder } from '../utils/ticket-filter.builder';

export interface CreateTicketRepoData {
  orgId: string;
  authorId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  category?: string;
  assigneeId?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface CreateCommentRepoData {
  ticketId: string;
  authorId: string;
  authorOrgId: string;
  content: string;
}

export interface CreateAttachmentRepoData {
  ticketId: string;
  uploaderId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export class TicketRepository {
  /**
   * Generates the next sequential ticket number within the given organization.
   */
  private async getNextTicketNumber(orgId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const db = tx ?? prisma;
    const aggregate = await db.ticket.aggregate({
      where: { orgId },
      _max: { ticketNumber: true },
    });
    return (aggregate._max.ticketNumber ?? 0) + 1;
  }

  /**
   * Creates a new support ticket record.
   */
  async createTicket(data: CreateTicketRepoData) {
    return prisma.$transaction(async (tx) => {
      const ticketNumber = await this.getNextTicketNumber(data.orgId, tx);

      return tx.ticket.create({
        data: {
          ticketNumber,
          orgId: data.orgId,
          authorId: data.authorId,
          assigneeId: data.assigneeId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          category: data.category ?? 'GENERAL',
          dueDate: data.dueDate,
          tags: data.tags ? (data.tags as any) : [],
        },
        include: {
          author: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
          assignee: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
        },
      });
    });
  }

  /**
   * Retrieves a single ticket by ID, strictly enforcing activeOrgId tenant scoping.
   */
  async findTicketById(id: string, activeOrgId: string) {
    return prisma.ticket.findFirst({
      where: {
        id,
        orgId: activeOrgId,
        deletedAt: null,
      },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        assignee: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
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
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves a paginated list of tickets for an organization based on filter options.
   */
  async findTickets(activeOrgId: string, options: TicketFilterOptions): Promise<PaginatedResult<any>> {
    const where = TicketFilterBuilder.buildWhereClause(activeOrgId, options);
    const orderBy = TicketFilterBuilder.buildOrderByClause(options.sortBy);

    const skip = (options.page - 1) * options.limit;

    const [tickets, totalRecords] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy,
        skip,
        take: options.limit,
        include: {
          author: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
          assignee: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / options.limit) || 1;

    return {
      data: tickets,
      meta: {
        page: options.page,
        limit: options.limit,
        totalRecords,
        totalPages,
      },
    };
  }

  /**
   * Updates ticket fields (title, description, priority, category, assigneeId, etc.).
   */
  async updateTicket(id: string, activeOrgId: string, data: Prisma.TicketUpdateInput) {
    return prisma.ticket.updateMany({
      where: {
        id,
        orgId: activeOrgId,
        deletedAt: null,
      },
      data,
    });
  }

  /**
   * Performs soft deletion of a ticket.
   */
  async softDeleteTicket(id: string, activeOrgId: string) {
    return prisma.ticket.updateMany({
      where: {
        id,
        orgId: activeOrgId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Assigns a ticket to a user.
   */
  async assignTicket(id: string, activeOrgId: string, assigneeId: string) {
    return prisma.ticket.updateMany({
      where: {
        id,
        orgId: activeOrgId,
        deletedAt: null,
      },
      data: {
        assigneeId,
      },
    });
  }

  /**
   * Updates the status of a ticket.
   */
  async updateTicketStatus(id: string, activeOrgId: string, status: TicketStatus) {
    return prisma.ticket.updateMany({
      where: {
        id,
        orgId: activeOrgId,
        deletedAt: null,
      },
      data: {
        status,
      },
    });
  }

  /**
   * Adds a comment to a ticket.
   */
  async createComment(data: CreateCommentRepoData) {
    return prisma.ticketComment.create({
      data: {
        ticketId: data.ticketId,
        authorId: data.authorId,
        authorOrgId: data.authorOrgId,
        content: data.content,
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
   * Finds a comment by ID.
   */
  async findCommentById(commentId: string) {
    return prisma.ticketComment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
      include: {
        ticket: {
          select: { id: true, orgId: true },
        },
      },
    });
  }

  /**
   * Lists comments for a ticket.
   */
  async findCommentsByTicketId(ticketId: string, activeOrgId: string) {
    // Enforce ticket tenant access
    const ticket = await this.findTicketById(ticketId, activeOrgId);
    if (!ticket) return null;

    return prisma.ticketComment.findMany({
      where: {
        ticketId,
        deletedAt: null,
      },
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
   * Updates comment content.
   */
  async updateComment(commentId: string, content: string) {
    return prisma.ticketComment.update({
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
   * Performs soft deletion of a comment.
   */
  async softDeleteComment(commentId: string) {
    return prisma.ticketComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Uploads attachment metadata to a ticket.
   */
  async createAttachment(data: CreateAttachmentRepoData) {
    return prisma.ticketAttachment.create({
      data: {
        ticketId: data.ticketId,
        uploaderId: data.uploaderId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      },
      include: {
        uploader: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  /**
   * Lists attachments for a ticket.
   */
  async findAttachmentsByTicketId(ticketId: string, activeOrgId: string) {
    const ticket = await this.findTicketById(ticketId, activeOrgId);
    if (!ticket) return null;

    return prisma.ticketAttachment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }
}
