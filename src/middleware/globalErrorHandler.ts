import type { ErrorRequestHandler } from 'express';
import AppError from '../utils/AppError.js';

const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: err instanceof Error ? err.message : String(err),
  });
};

export default globalErrorHandler;
