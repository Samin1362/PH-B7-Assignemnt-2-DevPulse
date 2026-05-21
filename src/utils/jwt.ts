import jwt, { type SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';

export type JwtPayload = {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
};

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, config.jwt_secret, {
    expiresIn: config.jwt_expires_in,
  } as SignOptions);

export const verifyToken = (token: string) =>
  jwt.verify(token, config.jwt_secret) as JwtPayload;
