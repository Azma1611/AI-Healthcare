import express from 'express';
import { realtimeStatus } from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/status', protect, realtimeStatus);
export default router;
