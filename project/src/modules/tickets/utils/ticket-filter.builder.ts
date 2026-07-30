import { Prisma, TicketStatus, TicketPriority } from '@prisma/client';
import { TicketFilterOptions } from '../types/ticket.types';

export class TicketFilterBuilder {
  /**
   * Constructs a tenant-isolated Prisma WHERE condition object for ticket listing.
   * Mandates `orgId = activeOrgId` and `deletedAt IS NULL`.
   */
  static buildWhereClause(activeOrgId: string, options: TicketFilterOptions): Prisma.TicketWhereInput {
    const where: Prisma.TicketWhereInput = {
      orgId: activeOrgId,
      deletedAt: null,
    };

    // Filter by Status
    if (options.status) {
      where.status = options.status;
    }

    // Filter by Priority
    if (options.priority) {
      where.priority = options.priority;
    }

    // Filter by Category
    if (options.category) {
      where.category = {
        equals: options.category,
        mode: 'insensitive',
      };
    }

    // Filter by Assignee
    if (options.assigneeId) {
      where.assigneeId = options.assigneeId;
    }

    // Filter by Author
    if (options.authorId) {
      where.authorId = options.authorId;
    }

    // Date Range Filters
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        where.createdAt.lte = new Date(options.endDate);
      }
    }

    // Full-Text Search across Title, Description, and Category
    if (options.search && options.search.trim() !== '') {
      const searchTerm = options.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Constructs a Prisma ORDER BY clause based on specified sort criteria.
   */
  static buildOrderByClause(sortBy: string): Prisma.TicketOrderByWithRelationInput {
    switch (sortBy) {
      case 'oldest':
        return { createdAt: 'asc' };
      case 'priority':
        return { priority: 'desc' };
      case 'updatedAt':
        return { updatedAt: 'desc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }
}
