import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

export const register = async (req: Request, res: Response) => {
  try {
    const data = await AuthService.registerUser(req.body);
    return sendSuccess(res, data, 'User registered successfully', 201);
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return sendError(res, error.message, 400);
    }
    return sendError(res, 'Registration failed', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = await AuthService.loginUser(req.body);
    return sendSuccess(res, data, 'Login successful');
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      return sendError(res, error.message, 401);
    }
    return sendError(res, 'Login failed', 500, error);
  }
};
