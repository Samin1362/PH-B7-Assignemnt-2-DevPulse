import AppError from '../../utils/AppError.js';

export type Role = 'contributor' | 'maintainer';

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export type LoginInput = {
  email: string;
  password: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignup = (raw: unknown): SignupInput => {
  if (!raw || typeof raw !== 'object') throw new AppError(400, 'Invalid request body');
  const { name, email, password, role } = raw as Record<string, unknown>;

  if (typeof name !== 'string' || !name.trim()) throw new AppError(400, 'Name is required');
  if (typeof email !== 'string' || !email.trim()) throw new AppError(400, 'Email is required');
  const cleanEmail = email.trim().toLowerCase();
  if (!emailRegex.test(cleanEmail)) throw new AppError(400, 'Invalid email format');
  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters');
  }
  if (role !== undefined && role !== 'contributor' && role !== 'maintainer') {
    throw new AppError(400, 'Role must be contributor or maintainer');
  }

  return { name: name.trim(), email: cleanEmail, password, role: role as Role | undefined };
};

export const validateLogin = (raw: unknown): LoginInput => {
  if (!raw || typeof raw !== 'object') throw new AppError(400, 'Invalid request body');
  const { email, password } = raw as Record<string, unknown>;

  if (typeof email !== 'string' || !email.trim()) throw new AppError(400, 'Email is required');
  if (typeof password !== 'string' || !password) throw new AppError(400, 'Password is required');

  return { email: email.trim().toLowerCase(), password };
};
