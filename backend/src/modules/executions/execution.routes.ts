import { Router } from 'express';
import { getExecutionsByWorkflow, getExecutionById, getAllExecutionsByWorkspace } from './execution.controller';
import { protect } from '../../middleware/auth.middleware';
import { protectWorkspace } from '../../middleware/workspace.middleware';

const router = Router();

// All execution routes require authentication and workspace scope
router.use(protect);
router.use(protectWorkspace);

router.get('/workflow/:workflowId', getExecutionsByWorkflow);
router.get('/', getAllExecutionsByWorkspace);
router.get('/:id', getExecutionById);

export default router;
