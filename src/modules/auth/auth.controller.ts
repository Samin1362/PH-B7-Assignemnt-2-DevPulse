import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { loginSchema, signupSchema } from './auth.validation.js';
import { loginUser, registerUser } from './auth.service.js';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const input = signupSchema.parse(req.body);
  const user = await registerUser(input);
  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: 'User registered successfully',
    data: user,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);
  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: 'Login successful',
    data: result,
  });
});
