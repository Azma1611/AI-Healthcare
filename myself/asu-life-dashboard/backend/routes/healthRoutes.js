import express from 'express';
import { addSleepEntry, getHealth, toggleMeal, updateWaterReminder } from '../controllers/healthController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.get('/', getHealth);
router.patch('/water', updateWaterReminder);
router.post('/sleep', requireFields('date', 'hours'), addSleepEntry);
router.patch('/meals/:mealId/toggle', toggleMeal);
export default router;
