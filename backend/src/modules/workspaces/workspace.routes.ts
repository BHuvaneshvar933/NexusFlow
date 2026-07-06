import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { protect } from '../../middleware/auth.middleware';
import { protectWorkspace } from '../../middleware/workspace.middleware';

const router = Router();

// Base routes (only require auth)
router.get('/', protect, WorkspaceController.getUserWorkspaces);
router.post('/', protect, WorkspaceController.createWorkspace);

// Workspace-specific routes (require workspace context)
router.post('/members', protect, protectWorkspace, WorkspaceController.inviteMember);

export default router;
