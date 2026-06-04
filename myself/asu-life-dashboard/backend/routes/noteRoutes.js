import express from 'express';
import { notesController } from '../controllers/moduleControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(notesController.getAll).post(requireFields('title', 'content', 'date'), notesController.create);
router.route('/:id').get(notesController.getOne).put(notesController.update).delete(notesController.remove);
export default router;
