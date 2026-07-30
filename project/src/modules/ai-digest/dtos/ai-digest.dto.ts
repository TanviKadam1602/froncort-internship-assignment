import { z } from 'zod';
import { DigestInterval } from '@prisma/client';

export const generateDigestSchema = z.object({
  body: z.object({
    intervalType: z.nativeEnum(DigestInterval).optional().default(DigestInterval.DAILY),
  }),
});

export const getDigestByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid digest ID format'),
  }),
});

export const listDigestsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
    limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10)),
  }),
});

export type GenerateDigestInputDTO = z.infer<typeof generateDigestSchema>['body'];
