import express from 'express';
import { remindersController } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(remindersController.getAll).post(requireFields('title', 'date'), remindersController.create);
router.route('/:id').get(remindersController.getOne).put(remindersController.update).delete(remindersController.remove);
export default router;
