export type AuditSortField = 'newest' | 'oldest' | 'action';

export interface AuditFilterOptions {
  actorId?: string;
  actionType?: string;
  module?: string;
  resourceType?: string;
  resourceId?: string;
  correlationId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
  sortBy: AuditSortField;
}

export interface AuditVerificationResult {
  isChainValid: boolean;
  totalRecords: number;
  tamperedRecordId?: string;
  tamperedIndex?: number;
  message: string;
}

export interface TimelineGroup {
  date: string;
  events: any[];
}
