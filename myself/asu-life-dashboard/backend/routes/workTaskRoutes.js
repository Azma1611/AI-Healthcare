import express from 'express';
import { toggleWorkTask, workTasksController } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(workTasksController.getAll).post(requireFields('title'), workTasksController.create);
router.patch('/:id/toggle', toggleWorkTask);
router.route('/:id').get(workTasksController.getOne).put(workTasksController.update).delete(workTasksController.remove);
export default router;
