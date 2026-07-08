import { Router } from 'express';
import { dataStoreController } from './datastore.controller';
import { protect } from '../../middleware/auth.middleware';
import { protectWorkspace } from '../../middleware/workspace.middleware';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(protectWorkspace);

router.get('/collections', dataStoreController.getCollections.bind(dataStoreController));
router.get('/collections/:collectionName/documents', dataStoreController.getDocuments.bind(dataStoreController));
router.delete('/documents/:documentId', dataStoreController.deleteDocument.bind(dataStoreController));

export default router;
