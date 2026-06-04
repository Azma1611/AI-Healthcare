import express from 'express';
import { goalsController } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(goalsController.getAll).post(requireFields('title'), goalsController.create);
router.route('/:id').get(goalsController.getOne).put(goalsController.update).delete(goalsController.remove);
export default router;
