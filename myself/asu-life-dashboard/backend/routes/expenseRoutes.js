import express from 'express';
import { expensesController } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(expensesController.getAll).post(requireFields('amount', 'date'), expensesController.create);
router.route('/:id').get(expensesController.getOne).put(expensesController.update).delete(expensesController.remove);
export default router;
