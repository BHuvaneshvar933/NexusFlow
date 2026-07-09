import { Request, Response } from 'express';
import { SecretService } from './secret.service';
import { sendSuccess, sendError } from '../../utils/response';

export class SecretController {
  static async getSecrets(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const secrets = await SecretService.getSecrets(workspaceId);
      sendSuccess(res, secrets);
    } catch (error: any) {
      sendError(res, error.message || 'Error fetching secrets', 500);
    }
  }

  static async createSecret(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;
      const { name, value, description } = req.body;

      if (role !== 'owner' && role !== 'admin') {
        return sendError(res, 'Only owners or admins can manage secrets', 403);
      }

      const secret = await SecretService.createSecret(workspaceId, name, value, description);
      sendSuccess(res, secret, 'Secret created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message || 'Error creating secret', 400);
    }
  }

  static async updateSecret(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;
      const name = req.params.name;
      const { value, description } = req.body;

      if (role !== 'owner' && role !== 'admin') {
        return sendError(res, 'Only owners or admins can manage secrets', 403);
      }

      const secret = await SecretService.updateSecret(workspaceId, name as string, value, description);
      sendSuccess(res, secret, 'Secret updated successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Error updating secret', 400);
    }
  }

  static async deleteSecret(req: Request, res: Response) {
    try {
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).workspaceRole;
      const name = req.params.name;

      if (role !== 'owner' && role !== 'admin') {
        return sendError(res, 'Only owners or admins can manage secrets', 403);
      }

      await SecretService.deleteSecret(workspaceId, name as string);
      sendSuccess(res, null, 'Secret deleted successfully');
    } catch (error: any) {
      sendError(res, error.message || 'Error deleting secret', 400);
    }
  }
}
