import { Study } from '../models/Study.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { normalizeItem } from '../utils/normalize.js';
import { ApiError } from '../utils/apiError.js';

const getOrCreateStudy = async (owner) =>
  Study.findOneAndUpdate(
    { owner },
    { $setOnInsert: { owner, subjects: [], attendance: [], hours: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

export const getStudy = asyncHandler(async (req, res) => {
  const study = await getOrCreateStudy(req.user._id);
  res.json({ success: true, data: normalizeItem(study) });
});

export const updateStudy = asyncHandler(async (req, res) => {
  const study = await Study.findOneAndUpdate({ owner: req.user._id }, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.json({ success: true, data: normalizeItem(study) });
});

export const addStudySubject = asyncHandler(async (req, res) => {
  const study = await getOrCreateStudy(req.user._id);
  study.subjects.push(req.body);
  study.attendance.push({ subject: req.body.name, percentage: 100 });
  await study.save();
  res.status(201).json({ success: true, data: normalizeItem(study) });
});

export const updateStudySubject = asyncHandler(async (req, res) => {
  const study = await getOrCreateStudy(req.user._id);
  const subject = study.subjects.id(req.params.subjectId);
  if (!subject) throw new ApiError('Subject not found', 404);
  Object.assign(subject, req.body);
  await study.save();
  res.json({ success: true, data: normalizeItem(study) });
});

export const addStudyHours = asyncHandler(async (req, res) => {
  const study = await getOrCreateStudy(req.user._id);
  study.hours.push(req.body);
  await study.save();
  res.status(201).json({ success: true, data: normalizeItem(study) });
});
