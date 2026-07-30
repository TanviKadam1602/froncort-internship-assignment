import { z } from 'zod';
import { PRStatus } from '@prisma/client';

export const createPRSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'PR Title must be at least 3 characters long').max(255).trim(),
    description: z.string().min(5, 'PR Description must be at least 5 characters long').trim(),
    sourceBranch: z.string().min(1).max(255).optional().default('feature/branch'),
    targetBranch: z.string().min(1).max(255).optional().default('main'),
    diffContent: z.string().min(1, 'diffContent is required to create a PR version snapshot'),
    requiresNApprovals: z.number().int().min(1).max(10).optional().default(2),
    reviewerIds: z.array(z.string().uuid()).optional().default([]),
    labels: z.array(z.string()).optional().default([]),
    githubPrNumber: z.number().int().optional(),
    githubRepoName: z.string().max(255).optional(),
  }),
});

export const updatePRSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
  body: z.object({
    title: z.string().min(3).max(255).trim().optional(),
    description: z.string().min(5).trim().optional(),
    sourceBranch: z.string().min(1).max(255).optional(),
    targetBranch: z.string().min(1).max(255).optional(),
    diffContent: z.string().optional(),
    status: z.nativeEnum(PRStatus).optional(),
    labels: z.array(z.string()).optional(),
  }),
});

export const updatePRStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(PRStatus, {
      errorMap: () => ({ message: 'Invalid PR Status. Allowed: DRAFT, OPEN, IN_REVIEW, CHANGES_REQUESTED, APPROVED, REJECTED, MERGED, CLOSED' }),
    }),
  }),
});

export const approvePRSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
  body: z.object({
    comment: z.string().optional(),
  }),
});

export const requestChangesPRSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
  body: z.object({
    comment: z.string().min(1, 'Comment is required when requesting changes').trim(),
  }),
});

export const mergePRSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
});

export const assignReviewersSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
  body: z.object({
    reviewerIds: z.array(z.string().uuid('reviewerId must be a valid UUID')).min(1, 'At least one reviewer must be assigned'),
  }),
});

export const createPRCommentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty').trim(),
  }),
});

export const updatePRCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid('Invalid comment ID format'),
  }),
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty').trim(),
  }),
});

export const deletePRCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid('Invalid comment ID format'),
  }),
});

export const getPRByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
  }),
});

export const listPRsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
    status: z.nativeEnum(PRStatus).optional(),
    authorId: z.string().uuid().optional(),
    reviewerId: z.string().uuid().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['newest', 'oldest', 'updatedAt']).optional().default('newest'),
  }),
});

export const getPRDiffSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid PR ID format'),
    versionNumber: z.string().transform((val) => parseInt(val, 10)),
  }),
  query: z.object({
    fromVersion: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  }),
});

export type CreatePRInput = z.infer<typeof createPRSchema>['body'];
export type UpdatePRInput = z.infer<typeof updatePRSchema>['body'];
export type SubmitReviewInput = { status: string; comment?: string };
