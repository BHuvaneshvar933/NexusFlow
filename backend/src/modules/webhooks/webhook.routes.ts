import { Router } from 'express';
import { handleWebhook } from './webhook.controller';

const router = Router();

// Public unauthenticated routes for external integrations
router.post('/:workflowId', handleWebhook);
router.get('/:workflowId', handleWebhook);

export default router;
