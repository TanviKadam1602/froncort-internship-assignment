import { Request, Response } from 'express';
import { PRService } from '../services/pr.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { asyncHandler } from '../../../core/utils/async-handler';
import { ApiError } from '../../../core/utils/api-error';

export class PRController {
  constructor(private readonly prService: PRService = new PRService()) {}

  /**
   * POST /api/v1/prs
   */
  createPR = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const pr = await this.prService.createPR(req.user, req.body);
    return res.status(201).json(ApiResponse.created(pr, 'Pull Request created successfully'));
  });

  /**
   * GET /api/v1/prs/:id
   */
  getPRById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pr = await this.prService.getPRById(req.user, prId);
    return res.status(200).json(ApiResponse.success(pr, 'Pull Request details retrieved successfully'));
  });

  /**
   * GET /api/v1/prs
   */
  listPRs = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const queryOptions: any = req.query;
    const result = await this.prService.listPRs(req.user, queryOptions);
    return res.status(200).json(ApiResponse.success(result.data, 'Pull Requests retrieved successfully', 200, result.meta));
  });

  /**
   * PATCH /api/v1/prs/:id
   */
  updatePR = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pr = await this.prService.updatePR(req.user, prId, req.body);
    return res.status(200).json(ApiResponse.success(pr, 'Pull Request updated successfully'));
  });

  /**
   * DELETE /api/v1/prs/:id
   */
  deletePR = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await this.prService.deletePR(req.user, prId);
    return res.status(200).json(ApiResponse.success(result, 'Pull Request deleted successfully'));
  });

  /**
   * PATCH /api/v1/prs/:id/status
   */
  changeStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pr = await this.prService.changeStatus(req.user, prId, req.body.status);
    return res.status(200).json(ApiResponse.success(pr, 'Pull Request status updated successfully'));
  });

  /**
   * PATCH /api/v1/prs/:id/merge
   */
  mergePR = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pr = await this.prService.mergePR(req.user, prId);
    return res.status(200).json(ApiResponse.success(pr, 'Pull Request merged successfully'));
  });

  /**
   * PATCH /api/v1/prs/:id/approve
   */
  approvePR = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pr = await this.prService.approvePR(req.user, prId, req.body.comment);
    return res.status(200).json(ApiResponse.success(pr, 'Pull Request approved successfully'));
  });

  /**
   * PATCH /api/v1/prs/:id/request-changes
   */
  requestChangesPR = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pr = await this.prService.requestChangesPR(req.user, prId, req.body.comment);
    return res.status(200).json(ApiResponse.success(pr, 'Changes requested on Pull Request'));
  });

  /**
   * PATCH /api/v1/prs/:id/reviewers
   */
  assignReviewers = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pr = await this.prService.assignReviewers(req.user, prId, req.body.reviewerIds);
    return res.status(200).json(ApiResponse.success(pr, 'Reviewers assigned successfully'));
  });

  /**
   * GET /api/v1/prs/:id/versions
   */
  getPRVersions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const versions = await this.prService.getPRVersions(req.user, prId);
    return res.status(200).json(ApiResponse.success(versions, 'PR version history retrieved successfully'));
  });

  /**
   * GET /api/v1/prs/:id/versions/:versionNumber/diff
   */
  getPRVersionDiff = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const versionNumber = parseInt(Array.isArray(req.params.versionNumber) ? req.params.versionNumber[0] : req.params.versionNumber, 10);
    const fromVersion = req.query.fromVersion ? parseInt(req.query.fromVersion as string, 10) : undefined;

    const diff = await this.prService.getPRVersionDiff(req.user, prId, versionNumber, fromVersion);
    return res.status(200).json(ApiResponse.success(diff, 'PR version diff retrieved successfully'));
  });

  /**
   * POST /api/v1/prs/:id/comments
   */
  addComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comment = await this.prService.addComment(req.user, prId, req.body.content);
    return res.status(201).json(ApiResponse.created(comment, 'PR Comment added successfully'));
  });

  /**
   * GET /api/v1/prs/:id/comments
   */
  listComments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const prId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comments = await this.prService.listComments(req.user, prId);
    return res.status(200).json(ApiResponse.success(comments, 'PR Comments retrieved successfully'));
  });

  /**
   * PATCH /api/v1/prs/comments/:commentId
   */
  updateComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const comment = await this.prService.updateComment(req.user, commentId, req.body.content);
    return res.status(200).json(ApiResponse.success(comment, 'PR Comment updated successfully'));
  });

  /**
   * DELETE /api/v1/prs/comments/:commentId
   */
  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const result = await this.prService.deleteComment(req.user, commentId);
    return res.status(200).json(ApiResponse.success(result, 'PR Comment deleted successfully'));
  });
}
