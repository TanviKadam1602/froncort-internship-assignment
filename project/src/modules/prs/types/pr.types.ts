import { PRStatus, PRReviewStatus } from '@prisma/client';

export type PRSortField = 'newest' | 'oldest' | 'updatedAt';

export interface PRFilterOptions {
  status?: PRStatus;
  authorId?: string;
  reviewerId?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy: PRSortField;
}

export interface PRDiffResponse {
  prId: string;
  fromVersion: number;
  toVersion: number;
  diffContent: string;
  fromTitle?: string;
  toTitle?: string;
}
