import type { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const notFound: RequestHandler = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    errors: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

export default notFound;
