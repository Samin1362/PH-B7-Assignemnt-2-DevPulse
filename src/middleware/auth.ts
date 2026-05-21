import type { RequestHandler } from 'express';
import AppError from '../utils/AppError.js';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization;
  if (!token) return next(new AppError(401, 'Authentication required'));
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
};

export const authorize =
  (...roles: JwtPayload['role'][]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    next();
  };
