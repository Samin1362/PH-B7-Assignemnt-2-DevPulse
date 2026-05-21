import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(150, 'Title must be at most 150 characters'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters'),
  type: z.enum(['bug', 'feature_request']),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

export const updateIssueSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(150, 'Title must be at most 150 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters')
      .optional(),
    type: z.enum(['bug', 'feature_request']).optional(),
    status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

export const issueIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid issue id'),
});

export const issuesQuerySchema = z.object({
  sort: z.enum(['newest', 'oldest']).default('newest'),
  type: z.enum(['bug', 'feature_request']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
});

export type IssuesQueryInput = z.infer<typeof issuesQuerySchema>;
