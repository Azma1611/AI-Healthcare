import express from 'express';
import { savingsController } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(savingsController.getAll).post(requireFields('amount', 'date'), savingsController.create);
router.route('/:id').get(savingsController.getOne).put(savingsController.update).delete(savingsController.remove);
export default router;
