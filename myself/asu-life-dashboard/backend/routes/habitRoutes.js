import express from 'express';
import { habitsController, toggleHabit } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(habitsController.getAll).post(requireFields('name'), habitsController.create);
router.patch('/:id/toggle', toggleHabit);
router.route('/:id').get(habitsController.getOne).put(habitsController.update).delete(habitsController.remove);
export default router;
