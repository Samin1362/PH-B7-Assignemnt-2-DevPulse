import type { Request, Response } from 'express';
import { validateSignup, validateLogin } from './auth.validation.js';
import { registerUser, loginUser } from './auth.service.js';

export const signup = async (req: Request, res: Response) => {
  const user = await registerUser(validateSignup(req.body));
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: user,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = await loginUser(validateLogin(req.body));
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data,
  });
};
