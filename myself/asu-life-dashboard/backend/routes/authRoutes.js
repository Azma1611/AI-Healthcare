import express from 'express';
import { login, logout, me, register, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', requireFields('email', 'password', 'role'), register);
router.post('/login', requireFields('email', 'password'), login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.put('/me', protect, updateMe);

export default router;
