import express from 'express';
import { earningsController } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(earningsController.getAll).post(requireFields('amount', 'date'), earningsController.create);
router.route('/:id').get(earningsController.getOne).put(earningsController.update).delete(earningsController.remove);
export default router;
