import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Try to get token from cookies (Primary)
    // 2. Fallback to Authorization header (for API clients)
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    (req as any).user = decoded;
    
    // Quick hack for this project scope: assume user is part of a default workspace
    // In a real app, this is determined by URL or headers
    (req as any).workspaceId = 'default-workspace'; 

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};
