import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../../middleware/workspace.middleware';

const router = Router();

// Base routes (only require auth)
router.get('/', requireAuth, WorkspaceController.getUserWorkspaces);
router.post('/', requireAuth, WorkspaceController.createWorkspace);

// Workspace specific routes (require workspace access)
router.put('/:workspaceId', requireAuth, requireWorkspaceAccess, WorkspaceController.updateWorkspace);
router.delete('/:workspaceId', requireAuth, requireWorkspaceAccess, WorkspaceController.deleteWorkspace);

// Members
router.get('/:workspaceId/members', requireAuth, requireWorkspaceAccess, WorkspaceController.getMembers);
router.post('/:workspaceId/members', requireAuth, requireWorkspaceAccess, WorkspaceController.inviteMember);
router.put('/:workspaceId/members/:userId', requireAuth, requireWorkspaceAccess, WorkspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:userId', requireAuth, requireWorkspaceAccess, WorkspaceController.removeMember);

export default router;
