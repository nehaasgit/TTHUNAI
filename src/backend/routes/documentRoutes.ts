import { Router } from 'express';
import { listDocuments, uploadDocument, deleteDocument, verifyDocument, syncProfile } from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, listDocuments);
router.post('/upload', authMiddleware, uploadDocument);
router.delete('/:id', authMiddleware, deleteDocument);
router.post('/:id/verify', authMiddleware, verifyDocument);
router.post('/:id/sync-profile', authMiddleware, syncProfile);

export default router;
