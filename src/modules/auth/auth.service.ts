import bcrypt from 'bcrypt';
import { pool } from '../../db/index.js';
import config from '../../config/index.js';
import AppError from '../../utils/AppError.js';
import { signToken } from '../../utils/jwt.js';
import type { SignupInput, LoginInput } from './auth.validation.js';

export const registerUser = async ({ name, email, password, role }: SignupInput) => {
  const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (existing.rowCount) throw new AppError(400, 'Email already in use');

  const hashed = await bcrypt.hash(password, config.bcrypt_salt_rounds);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashed, role || 'contributor'],
  );
  return rows[0];
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1',
    [email],
  );
  if (!rows[0]) throw new AppError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, rows[0].password);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const { password: _, ...user } = rows[0];
  return { token: signToken({ id: user.id, name: user.name, role: user.role }), user };
};
