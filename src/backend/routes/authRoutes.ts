import { Router } from 'express';
import { login, sendOTP, verifyOTP, getProfile, setupProfile, updateProfile, getSchemes } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public auth endpoints
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Protected profile & core resource endpoints
router.get('/profile', authMiddleware, getProfile);
router.post('/setup-profile', authMiddleware, setupProfile);
router.patch('/profile', authMiddleware, updateProfile);
router.get('/schemes', authMiddleware, getSchemes);

export default router;
