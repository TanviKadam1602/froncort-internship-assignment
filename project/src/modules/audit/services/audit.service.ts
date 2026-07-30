import { AuditRepository, CreateAuditRepoData } from '../repositories/audit.repository';
import { AuditFilterOptions, AuditVerificationResult, TimelineGroup } from '../types/audit.types';
import { AuthenticatedUser } from '../../../middleware/authenticate.middleware';
import { ApiError } from '../../../core/utils/api-error';
import { HashChainBuilder } from '../utils/hash-chain.builder';
import { CSVExporter } from '../utils/csv-exporter';

export class AuditService {
  constructor(private readonly auditRepo: AuditRepository = new AuditRepository()) {}

  /**
   * Internal Method: Records an immutable audit log entry.
   */
  async recordAuditEvent(data: CreateAuditRepoData) {
    return this.auditRepo.createAuditEntry(data);
  }

  /**
   * Retrieves a single audit log entry by ID.
   */
  async getAuditById(actor: AuthenticatedUser, id: string) {
    // RBAC Check: USER has no access to audit logs
    if (actor.role === 'USER' && !actor.isPlatformSuperAdmin) {
      throw ApiError.forbidden('End users do not have access to audit logs', 'INSUFFICIENT_PERMISSIONS');
    }

    const log = await this.auditRepo.findAuditById(id, actor.activeOrgId);
    if (!log) {
      throw ApiError.notFound('Audit log entry not found', 'AUDIT_NOT_FOUND');
    }

    // SUPPORT_AGENT can only view logs where they are the actor
    if (actor.role === 'SUPPORT_AGENT' && log.actorId !== actor.userId && !actor.isPlatformSuperAdmin) {
      throw ApiError.forbidden('Support Agents can only view their own audit logs', 'INSUFFICIENT_PERMISSIONS');
    }

    return log;
  }

  /**
   * Lists audit logs with search, filtering, and pagination.
   */
  async listAuditLogs(actor: AuthenticatedUser, options: AuditFilterOptions) {
    if (actor.role === 'USER' && !actor.isPlatformSuperAdmin) {
      throw ApiError.forbidden('End users do not have access to audit logs', 'INSUFFICIENT_PERMISSIONS');
    }

    // SUPPORT_AGENT role is scoped to their own actorId
    if (actor.role === 'SUPPORT_AGENT' && !actor.isPlatformSuperAdmin) {
      options.actorId = actor.userId;
    }

    return this.auditRepo.findAuditLogs(actor.activeOrgId, options);
  }

  /**
   * Retrieves audit timeline grouped by date for visual display.
   */
  async getAuditTimeline(actor: AuthenticatedUser, options: AuditFilterOptions): Promise<TimelineGroup[]> {
    const result = await this.listAuditLogs(actor, { ...options, limit: 100 });

    const groupedMap = new Map<string, any[]>();
    for (const item of result.data) {
      const dateStr = new Date(item.timestamp).toISOString().split('T')[0];
      if (!groupedMap.has(dateStr)) {
        groupedMap.set(dateStr, []);
      }
      groupedMap.get(dateStr)!.push(item);
    }

    const timeline: TimelineGroup[] = [];
    groupedMap.forEach((events, date) => {
      timeline.push({ date, events });
    });

    return timeline;
  }

  /**
   * Exports audit logs as CSV.
   */
  async exportAuditCSV(actor: AuthenticatedUser, query: { startDate?: string; endDate?: string; module?: string; actionType?: string }) {
    const isManagerOrAdmin = ['ORG_ADMIN', 'SUPPORT_MANAGER'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!isManagerOrAdmin) {
      throw ApiError.forbidden('Only Managers or Admins can export audit logs', 'INSUFFICIENT_PERMISSIONS');
    }

    const start = query.startDate ? new Date(query.startDate) : undefined;
    const end = query.endDate ? new Date(query.endDate) : undefined;

    const records = await this.auditRepo.findAuditForExport(actor.activeOrgId, start, end, query.module, query.actionType);

    return CSVExporter.generateCSV(records);
  }

  /**
   * Verifies the cryptographic hash chain integrity of the tenant's audit log.
   */
  async verifyHashChain(actor: AuthenticatedUser): Promise<AuditVerificationResult> {
    const isManagerOrAdmin = ['ORG_ADMIN', 'SUPPORT_MANAGER'].includes(actor.role) || actor.isPlatformSuperAdmin;
    if (!isManagerOrAdmin) {
      throw ApiError.forbidden('Only Managers or Admins can run audit integrity verification', 'INSUFFICIENT_PERMISSIONS');
    }

    const records = await this.auditRepo.findAuditHistoryForVerification(actor.activeOrgId);

    if (records.length === 0) {
      return {
        isChainValid: true,
        totalRecords: 0,
        message: 'No audit records exist for this organization yet.',
      };
    }

    let expectedPrevHash: string | null = null;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // 1. Verify previous hash pointer matches expected
      if (i > 0 && record.previousHash !== expectedPrevHash) {
        return {
          isChainValid: false,
          totalRecords: records.length,
          tamperedRecordId: record.id,
          tamperedIndex: i,
          message: `Chain broken at record index ${i} (${record.id}). Previous hash mismatch.`,
        };
      }

      // 2. Re-compute hash
      const computedHash = HashChainBuilder.calculateHash({
        previousHash: record.previousHash,
        timestamp: record.timestamp,
        actorId: record.actorId,
        actionType: record.actionType,
        resourceType: record.resourceType,
        resourceId: record.resourceId,
        changeset: record.changeset,
      });

      if (record.currentHash && record.currentHash !== computedHash) {
        return {
          isChainValid: false,
          totalRecords: records.length,
          tamperedRecordId: record.id,
          tamperedIndex: i,
          message: `Tampered payload detected at record index ${i} (${record.id}). Current hash mismatch.`,
        };
      }

      expectedPrevHash = record.currentHash || record.previousHash;
    }

    return {
      isChainValid: true,
      totalRecords: records.length,
      message: `Cryptographic hash chain verified successfully across ${records.length} records. Zero tampering detected.`,
    };
  }
}
