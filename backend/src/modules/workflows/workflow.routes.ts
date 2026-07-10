import { Router } from 'express';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  triggerWorkflow,
  shareWorkflow,
  getSharedWorkflow,
  duplicateWorkflow,
  getTemplates
} from './workflow.controller';
import { protect } from '../../middleware/auth.middleware';
import { protectWorkspace } from '../../middleware/workspace.middleware';

const router = Router();

// Public routes
router.get('/public/templates', getTemplates);
router.get('/public/shared/:shareId', getSharedWorkflow);

// All other workflow routes require authentication and a valid workspace ID
router.use(protect);
router.use(protectWorkspace);

router.post('/public/shared/:shareId/duplicate', duplicateWorkflow);

router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.get('/:id', getWorkflowById);
router.patch('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);
router.post('/:id/trigger', triggerWorkflow);
router.post('/:id/share', shareWorkflow);

export default router;
