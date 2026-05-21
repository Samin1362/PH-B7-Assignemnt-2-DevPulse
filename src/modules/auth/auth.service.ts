import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { pool } from '../../db/index.js';
import AppError from '../../utils/AppError.js';
import config from '../../config/index.js';
import { signToken } from '../../utils/jwt.js';
import type { LoginInput, SignupInput } from './auth.validation.js';

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

interface UserRow extends UserPublic {
  password: string;
}

export const registerUser = async (input: SignupInput): Promise<UserPublic> => {
  const existing = await pool.query(
    'SELECT 1 FROM users WHERE email = $1',
    [input.email],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email already in use');
  }

  const hashed = await bcrypt.hash(input.password, config.bcrypt_salt_rounds);
  const role = input.role ?? 'contributor';

  const result = await pool.query<UserPublic>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [input.name, input.email, hashed, role],
  );

  return result.rows[0] as UserPublic;
};

export const loginUser = async (
  input: LoginInput,
): Promise<{ token: string; user: UserPublic }> => {
  const result = await pool.query<UserRow>(
    `SELECT id, name, email, password, role, created_at, updated_at
     FROM users WHERE email = $1`,
    [input.email],
  );

  if (result.rowCount === 0) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const user = result.rows[0] as UserRow;
  const valid = await bcrypt.compare(input.password, user.password);

  if (!valid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  const token = signToken({ id: user.id, name: user.name, role: user.role });

  const { password: _password, ...userPublic } = user;
  return { token, user: userPublic };
};
