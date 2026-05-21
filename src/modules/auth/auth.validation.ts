import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Invalid email format').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['contributor', 'maintainer']).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.email('Invalid email format').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
