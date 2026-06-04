import express from 'express';
import { createLanguage, deleteLanguage, getLanguages, updateLanguage, updateLanguageProgress } from '../controllers/languageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.route('/').get(getLanguages).post(requireFields('key'), createLanguage);
router.patch('/:key/progress', updateLanguageProgress);
router.route('/:key').put(updateLanguage).delete(deleteLanguage);
export default router;
