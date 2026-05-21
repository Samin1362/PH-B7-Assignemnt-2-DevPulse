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

export const issueIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid issue id'),
});
