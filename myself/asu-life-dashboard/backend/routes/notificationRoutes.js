import express from 'express';
import { notificationStatus } from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/status', protect, notificationStatus);
export default router;
