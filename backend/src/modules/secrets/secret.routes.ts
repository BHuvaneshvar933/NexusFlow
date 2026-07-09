import { Router } from 'express';
import { SecretController } from './secret.controller';
import { protect } from '../../middleware/auth.middleware';
import { protectWorkspace } from '../../middleware/workspace.middleware';

const router = Router();

// All secret routes require authentication and workspace access
router.use(protect);
router.use('/:workspaceId', protectWorkspace);

router.get('/:workspaceId', SecretController.getSecrets);
router.post('/:workspaceId', SecretController.createSecret);
router.put('/:workspaceId/:name', SecretController.updateSecret);
router.delete('/:workspaceId/:name', SecretController.deleteSecret);

export default router;
