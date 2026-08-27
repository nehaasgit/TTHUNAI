import { Router } from 'express';
import { getProfile, createProfile, updateProfile, handleVoiceCommand, getVoiceHistory } from '../controllers/profile.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Secure Profile CRUD operations
router.get('/', authMiddleware, getProfile);
router.post('/', authMiddleware, createProfile);
router.put('/', authMiddleware, updateProfile);

// Secure Voice Assistant interaction and command logs
router.post('/voice', authMiddleware, handleVoiceCommand);
router.get('/voice/history', authMiddleware, getVoiceHistory);

export default router;
