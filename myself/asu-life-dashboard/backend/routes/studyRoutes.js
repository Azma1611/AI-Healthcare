import express from 'express';
import { addStudyHours, addStudySubject, getStudy, updateStudy, updateStudySubject } from '../controllers/studyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();
router.use(protect);
router.get('/', getStudy);
router.put('/', updateStudy);
router.post('/subjects', requireFields('name'), addStudySubject);
router.put('/subjects/:subjectId', updateStudySubject);
router.post('/hours', requireFields('date', 'hours'), addStudyHours);
export default router;
