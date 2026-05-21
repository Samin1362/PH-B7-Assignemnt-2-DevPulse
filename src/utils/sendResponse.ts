import type { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ApiResponse<T>,
): Response => {
  const body: ApiResponse<T> = { success: payload.success };
  if (payload.message !== undefined) body.message = payload.message;
  if (payload.data !== undefined) body.data = payload.data;
  return res.status(statusCode).json(body);
};

export default sendResponse;
