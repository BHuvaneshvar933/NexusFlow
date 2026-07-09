import { Request, Response } from 'express';
import { WorkspaceService } from './workspace.service';
import { sendSuccess, sendError } from '../../utils/response';

export class WorkspaceController {
  static async getUserWorkspaces(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const workspaces = await WorkspaceService.getUserWorkspaces(userId);
      sendSuccess(res, workspaces);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching workspaces', 500);
    }
  }

  static async createWorkspace(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name } = req.body;
      
      if (!name) {
        return sendError(res, 'Workspace name is required', 400);
      }

      const workspace = await WorkspaceService.createWorkspace(userId, name);
      sendSuccess(res, workspace, 'Workspace created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Error creating workspace', 500);
    }
  }

  static async inviteMember(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;
      const { email, newRole } = req.body;

      if (role !== 'owner' && role !== 'admin') {
        return sendError(res, 'Only owners or admins can invite members', 403);
      }

      if (!email) {
        return sendError(res, 'Email is required', 400);
      }

      const member = await WorkspaceService.inviteMember(workspaceId, email, newRole || 'editor');
      sendSuccess(res, member, 'Member invited successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Error inviting member', 400);
    }
  }

  static async updateWorkspace(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;
      const { name } = req.body;

      if (role !== 'owner' && role !== 'admin') {
        return sendError(res, 'Only owners or admins can update the workspace', 403);
      }

      if (!name) {
        return sendError(res, 'Workspace name is required', 400);
      }

      const workspace = await WorkspaceService.updateWorkspace(workspaceId, name);
      sendSuccess(res, workspace, 'Workspace updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Error updating workspace', 400);
    }
  }

  static async deleteWorkspace(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;

      if (role !== 'owner') {
        return sendError(res, 'Only owners can delete the workspace', 403);
      }

      await WorkspaceService.deleteWorkspace(workspaceId);
      sendSuccess(res, null, 'Workspace deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Error deleting workspace', 400);
    }
  }

  static async getMembers(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const members = await WorkspaceService.getMembers(workspaceId);
      sendSuccess(res, members);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching members', 400);
    }
  }

  static async removeMember(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;
      const { userId } = req.params;

      if (role !== 'owner' && role !== 'admin') {
        return sendError(res, 'Only owners or admins can remove members', 403);
      }

      await WorkspaceService.removeMember(workspaceId, userId as string);
      sendSuccess(res, null, 'Member removed successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Error removing member', 400);
    }
  }

  static async updateMemberRole(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;
      const { userId } = req.params;
      const { role: newRole } = req.body;

      if (role !== 'owner' && role !== 'admin') {
        return sendError(res, 'Only owners or admins can update member roles', 403);
      }

      const member = await WorkspaceService.updateMemberRole(workspaceId, userId as string, newRole);
      sendSuccess(res, member, 'Member role updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Error updating member role', 400);
    }
  }
}
