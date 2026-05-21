import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import type { JwtPayload } from '../utils/jwt.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.trim()) {
    return next(
      new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required'),
    );
  }

  const token = header.startsWith('Bearer ')
    ? header.slice(7).trim()
    : header.trim();

  if (!token) {
    return next(
      new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required'),
    );
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError(StatusCodes.UNAUTHORIZED, 'Token expired'));
    }
    return next(new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token'));
  }
};

export const authorize = (
  ...allowedRoles: Array<JwtPayload['role']>
): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required'),
      );
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(StatusCodes.FORBIDDEN, 'Insufficient permissions'),
      );
    }
    return next();
  };
};
