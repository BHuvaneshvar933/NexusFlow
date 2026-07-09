import { Router } from 'express';
import { SecretController } from './secret.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireWorkspaceAccess } from '../../middleware/workspace.middleware';

const router = Router();

// All secret routes require authentication and workspace access
router.use(requireAuth);
router.use('/:workspaceId', requireWorkspaceAccess);

router.get('/:workspaceId', SecretController.getSecrets);
router.post('/:workspaceId', SecretController.createSecret);
router.put('/:workspaceId/:name', SecretController.updateSecret);
router.delete('/:workspaceId/:name', SecretController.deleteSecret);

export default router;
