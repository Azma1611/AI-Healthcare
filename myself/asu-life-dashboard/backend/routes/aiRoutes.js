import express from 'express';
import { aiChatStatus } from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/status', protect, aiChatStatus);
export default router;
