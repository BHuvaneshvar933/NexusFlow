import { Router } from 'express';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  triggerWorkflow
} from './workflow.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// All workflow routes require authentication
router.use(protect);

router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.get('/:id', getWorkflowById);
router.patch('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);
router.post('/:id/trigger', triggerWorkflow);

export default router;
