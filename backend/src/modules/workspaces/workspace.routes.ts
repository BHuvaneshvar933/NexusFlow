import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { protect } from '../../middleware/auth.middleware';
import { protectWorkspace } from '../../middleware/workspace.middleware';

const router = Router();

// Base routes (only require auth)
router.get('/', protect, WorkspaceController.getUserWorkspaces);
router.post('/', protect, WorkspaceController.createWorkspace);

// Workspace specific routes (require workspace access)
router.put('/:workspaceId', protect, protectWorkspace, WorkspaceController.updateWorkspace);
router.delete('/:workspaceId', protect, protectWorkspace, WorkspaceController.deleteWorkspace);

// Members
router.get('/:workspaceId/members', protect, protectWorkspace, WorkspaceController.getMembers);
router.post('/:workspaceId/members', protect, protectWorkspace, WorkspaceController.inviteMember);
router.put('/:workspaceId/members/:userId', protect, protectWorkspace, WorkspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:userId', protect, protectWorkspace, WorkspaceController.removeMember);

export default router;
