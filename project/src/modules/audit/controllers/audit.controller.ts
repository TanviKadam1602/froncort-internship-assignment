import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { asyncHandler } from '../../../core/utils/async-handler';
import { ApiError } from '../../../core/utils/api-error';

export class AuditController {
  constructor(private readonly auditService: AuditService = new AuditService()) {}

  /**
   * GET /api/v1/audit-logs or /api/v1/audit
   */
  listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const queryOptions: any = req.query;
    const result = await this.auditService.listAuditLogs(req.user, queryOptions);
    return res.status(200).json(ApiResponse.success(result.data, 'Audit log entries retrieved successfully', 200, result.meta));
  });

  /**
   * GET /api/v1/audit-logs/timeline or /api/v1/audit/timeline
   */
  getAuditTimeline = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const queryOptions: any = req.query;
    const timeline = await this.auditService.getAuditTimeline(req.user, queryOptions);
    return res.status(200).json(ApiResponse.success(timeline, 'Audit timeline retrieved successfully'));
  });

  /**
   * GET /api/v1/audit-logs/export or /api/v1/audit/export
   */
  exportAuditCSV = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const queryParams: any = req.query;
    const csvContent = await this.auditService.exportAuditCSV(req.user, queryParams);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  });

  /**
   * GET /api/v1/audit-logs/verify or /api/v1/audit/verify
   */
  verifyHashChain = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const verification = await this.auditService.verifyHashChain(req.user);
    return res.status(200).json(ApiResponse.success(verification, 'Cryptographic hash chain integrity check completed'));
  });

  /**
   * GET /api/v1/audit-logs/:id or /api/v1/audit/:id
   */
  getAuditById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const auditId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const log = await this.auditService.getAuditById(req.user, auditId);
    return res.status(200).json(ApiResponse.success(log, 'Audit log details retrieved successfully'));
  });
}
