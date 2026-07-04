import { Router } from 'express';
import { getExecutionsByWorkflow, getExecutionById } from './execution.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

// All execution routes require authentication
router.use(protect);

router.get('/workflow/:workflowId', getExecutionsByWorkflow);
router.get('/:id', getExecutionById);

export default router;
