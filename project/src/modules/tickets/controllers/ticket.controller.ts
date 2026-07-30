import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { ApiResponse } from '../../../core/utils/api-response';
import { asyncHandler } from '../../../core/utils/async-handler';
import { ApiError } from '../../../core/utils/api-error';

export class TicketController {
  constructor(private readonly ticketService: TicketService = new TicketService()) {}

  /**
   * POST /api/v1/tickets
   */
  createTicket = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticket = await this.ticketService.createTicket(req.user, req.body);
    return res.status(201).json(ApiResponse.created(ticket, 'Support ticket created successfully'));
  });

  /**
   * GET /api/v1/tickets/:id
   */
  getTicketById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await this.ticketService.getTicketById(req.user, ticketId);
    return res.status(200).json(ApiResponse.success(ticket, 'Ticket details retrieved successfully'));
  });

  /**
   * GET /api/v1/tickets
   */
  listTickets = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const queryOptions: any = req.query;
    const result = await this.ticketService.listTickets(req.user, queryOptions);
    return res.status(200).json(ApiResponse.success(result.data, 'Tickets retrieved successfully', 200, result.meta));
  });

  /**
   * PATCH /api/v1/tickets/:id
   */
  updateTicket = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await this.ticketService.updateTicket(req.user, ticketId, req.body);
    return res.status(200).json(ApiResponse.success(ticket, 'Ticket updated successfully'));
  });

  /**
   * DELETE /api/v1/tickets/:id
   */
  deleteTicket = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await this.ticketService.deleteTicket(req.user, ticketId);
    return res.status(200).json(ApiResponse.success(result, 'Ticket deleted successfully'));
  });

  /**
   * PATCH /api/v1/tickets/:id/assign
   */
  assignTicket = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await this.ticketService.assignTicket(req.user, ticketId, req.body.assigneeId);
    return res.status(200).json(ApiResponse.success(ticket, 'Ticket assigned successfully'));
  });

  /**
   * PATCH /api/v1/tickets/:id/status
   */
  changeStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const ticket = await this.ticketService.changeStatus(req.user, ticketId, req.body.status);
    return res.status(200).json(ApiResponse.success(ticket, 'Ticket status updated successfully'));
  });

  /**
   * POST /api/v1/tickets/:id/comments
   */
  addComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comment = await this.ticketService.addComment(req.user, ticketId, req.body);
    return res.status(201).json(ApiResponse.created(comment, 'Comment added successfully'));
  });

  /**
   * GET /api/v1/tickets/:id/comments
   */
  listComments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comments = await this.ticketService.listComments(req.user, ticketId);
    return res.status(200).json(ApiResponse.success(comments, 'Ticket comments retrieved successfully'));
  });

  /**
   * PATCH /api/v1/tickets/comments/:commentId
   */
  updateComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const comment = await this.ticketService.updateComment(req.user, commentId, req.body.content);
    return res.status(200).json(ApiResponse.success(comment, 'Comment updated successfully'));
  });

  /**
   * DELETE /api/v1/tickets/comments/:commentId
   */
  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;
    const result = await this.ticketService.deleteComment(req.user, commentId);
    return res.status(200).json(ApiResponse.success(result, 'Comment deleted successfully'));
  });

  /**
   * POST /api/v1/tickets/:id/attachments
   */
  addAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const attachment = await this.ticketService.addAttachment(req.user, ticketId, req.body);
    return res.status(201).json(ApiResponse.created(attachment, 'Attachment uploaded successfully'));
  });

  /**
   * GET /api/v1/tickets/:id/attachments
   */
  listAttachments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const attachments = await this.ticketService.listAttachments(req.user, ticketId);
    return res.status(200).json(ApiResponse.success(attachments, 'Ticket attachments retrieved successfully'));
  });
}
