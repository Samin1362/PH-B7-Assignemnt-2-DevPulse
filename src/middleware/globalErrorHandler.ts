import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';
import config from '../config/index.js';

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let errors: unknown = err instanceof Error ? err.message : String(err);

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.message;
  } else if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON payload';
    errors = (err as Error).message;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  const responseBody: Record<string, unknown> = {
    success: false,
    message,
    errors,
  };

  if (config.node_env !== 'production' && err instanceof Error) {
    responseBody['stack'] = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

export default globalErrorHandler;
