import { Request, Response } from 'express';
import { CrossOrgService } from '../services/cross-org.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { asyncHandler } from '../../../core/utils/async-handler';
import { ApiError } from '../../../core/utils/api-error';

export class CrossOrgController {
  constructor(private readonly crossOrgService: CrossOrgService = new CrossOrgService()) {}

  /**
   * POST /api/v1/collaboration/connections
   */
  requestConnection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const conn = await this.crossOrgService.requestConnection(req.user, req.body);
    return res.status(201).json(ApiResponse.created(conn, 'Partner connection request sent successfully'));
  });

  /**
   * GET /api/v1/collaboration/connections
   */
  listConnections = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const connections = await this.crossOrgService.listConnections(req.user);
    return res.status(200).json(ApiResponse.success(connections, 'Partner organization connections retrieved successfully'));
  });

  /**
   * PATCH /api/v1/collaboration/connections/:id
   */
  respondConnection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const connId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const conn = await this.crossOrgService.respondConnection(req.user, connId, req.body);
    return res.status(200).json(ApiResponse.success(conn, 'Partner connection status updated successfully'));
  });

  /**
   * PATCH /api/v1/collaboration/connections/:id/accept
   */
  acceptConnection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const connId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const conn = await this.crossOrgService.respondConnection(req.user, connId, { status: 'ACCEPTED' as any });
    return res.status(200).json(ApiResponse.success(conn, 'Partner connection accepted successfully'));
  });

  /**
   * PATCH /api/v1/collaboration/connections/:id/reject
   */
  rejectConnection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const connId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const conn = await this.crossOrgService.respondConnection(req.user, connId, { status: 'REJECTED' as any });
    return res.status(200).json(ApiResponse.success(conn, 'Partner connection rejected'));
  });

  /**
   * PATCH /api/v1/collaboration/connections/:id/cancel
   */
  cancelConnection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const connId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const conn = await this.crossOrgService.respondConnection(req.user, connId, { status: 'CANCELLED' as any });
    return res.status(200).json(ApiResponse.success(conn, 'Partner connection cancelled'));
  });

  /**
   * DELETE /api/v1/collaboration/connections/:id
   */
  deleteConnection = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const connId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await this.crossOrgService.deleteConnection(req.user, connId);
    return res.status(200).json(ApiResponse.success(result, 'Partner connection removed successfully'));
  });

  /**
   * POST /api/v1/collaboration/resources
   */
  shareResource = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const share = await this.crossOrgService.shareResource(req.user, req.body);
    return res.status(201).json(ApiResponse.created(share, 'Resource shared with partner organization successfully'));
  });

  /**
   * GET /api/v1/collaboration/resources
   */
  listSharedResources = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const shares = await this.crossOrgService.listSharedResources(req.user);
    return res.status(200).json(ApiResponse.success(shares, 'Shared resources list retrieved successfully'));
  });

  /**
   * GET /api/v1/collaboration/resources/:id
   */
  getSharedResourceById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const shareId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.crossOrgService.getSharedResourceById(req.user, shareId);
    return res.status(200).json(ApiResponse.success(data, 'Shared resource retrieved successfully'));
  });

  /**
   * PATCH /api/v1/collaboration/resources/:id
   */
  updateSharedResourcePermission = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const shareId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await this.crossOrgService.updateSharedResourcePermission(req.user, shareId, req.body);
    return res.status(200).json(ApiResponse.success(updated, 'Shared resource permission updated successfully'));
  });

  /**
   * DELETE /api/v1/collaboration/resources/:id
   */
  revokeSharedResource = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const shareId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await this.crossOrgService.revokeSharedResource(req.user, shareId);
    return res.status(200).json(ApiResponse.success(result, 'Shared resource mapping revoked successfully'));
  });
}
