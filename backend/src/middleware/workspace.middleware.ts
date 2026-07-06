import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';

export const protectWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.headers['x-workspace-id'] as string;

  if (!workspaceId) {
    return sendError(res, 'Workspace ID header (x-workspace-id) is required', 400);
  }

  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
    });

    if (!member) {
      return sendError(res, 'Not authorized to access this workspace', 403);
    }

    // Attach workspace and role to request
    (req as any).workspaceId = workspaceId;
    (req as any).workspaceRole = member.role;
    
    next();
  } catch (error) {
    console.error('[protectWorkspace] Error:', error);
    return sendError(res, 'Server error verifying workspace access', 500);
  }
};
