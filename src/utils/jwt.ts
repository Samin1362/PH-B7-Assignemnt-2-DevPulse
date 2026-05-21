import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import config from '../config/index.js';

export interface JwtPayload {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt_secret as Secret, {
    expiresIn: config.jwt_expires_in,
  } as SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, config.jwt_secret as Secret);
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
    throw new Error('Invalid token payload');
  }
  const { id, name, role } = decoded as Partial<JwtPayload>;
  if (typeof id !== 'number' || typeof name !== 'string' || (role !== 'contributor' && role !== 'maintainer')) {
    throw new Error('Invalid token payload');
  }
  return { id, name, role };
};
