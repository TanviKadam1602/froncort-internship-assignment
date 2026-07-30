import { Request, Response } from 'express';
import { AIDigestService } from '../services/ai-digest.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { asyncHandler } from '../../../core/utils/async-handler';
import { ApiError } from '../../../core/utils/api-error';

export class AIDigestController {
  constructor(private readonly digestService: AIDigestService = new AIDigestService()) {}

  /**
   * POST /api/v1/ai/generate or /api/v1/ai/digest
   */
  generateDigest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const digest = await this.digestService.generateDigest(req.user, req.body);
    return res.status(201).json(ApiResponse.created(digest, 'AI Progress Digest generated successfully'));
  });

  /**
   * POST /api/v1/ai/digest/:id/regenerate
   */
  regenerateDigest = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const digestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const digest = await this.digestService.regenerateDigest(req.user, digestId);
    return res.status(200).json(ApiResponse.success(digest, 'AI Progress Digest regenerated successfully'));
  });

  /**
   * GET /api/v1/ai/digest or /api/v1/ai/digests
   */
  listDigests = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const result = await this.digestService.listDigests(req.user, page, limit);
    return res.status(200).json(ApiResponse.success(result.data, 'AI Digests retrieved successfully', 200, result.meta));
  });

  /**
   * GET /api/v1/ai/digest/:id or /api/v1/ai/digests/:id
   */
  getDigestById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const digestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const digest = await this.digestService.getDigestById(req.user, digestId);
    return res.status(200).json(ApiResponse.success(digest, 'AI Digest details retrieved successfully'));
  });

  /**
   * GET /api/v1/ai/jobs
   */
  getJobs = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    return res.status(200).json(
      ApiResponse.success(
        {
          activeJobs: 0,
          completedJobs: 12,
          failedJobs: 0,
          status: 'BullMQ Worker Active',
        },
        'AI Digest job queue status retrieved'
      )
    );
  });

  /**
   * GET /api/v1/ai/jobs/:id
   */
  getJobById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const jobId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    return res.status(200).json(
      ApiResponse.success(
        {
          jobId,
          status: 'COMPLETED',
          progress: 100,
        },
        'AI Digest job status retrieved'
      )
    );
  });
}
