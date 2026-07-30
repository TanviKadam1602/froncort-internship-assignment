import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format').toLowerCase().trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters long').max(100).trim(),
    orgName: z.string().min(2, 'Organization name must be at least 2 characters long').max(100).trim(),
    orgSlug: z
      .string()
      .min(2, 'Org slug must be at least 2 characters long')
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Org slug must contain only lowercase letters, numbers, and hyphens')
      .toLowerCase()
      .trim(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
  cookies: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

export const switchOrgSchema = z.object({
  body: z.object({
    targetOrgId: z.string().uuid('targetOrgId must be a valid UUID'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type SwitchOrgInput = z.infer<typeof switchOrgSchema>['body'];
