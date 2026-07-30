import { TicketStatus, TicketPriority } from '@prisma/client';

export type TicketSortField = 'newest' | 'oldest' | 'priority' | 'updatedAt';

export interface TicketFilterOptions {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assigneeId?: string;
  authorId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  page: number;
  limit: number;
  sortBy: TicketSortField;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}
