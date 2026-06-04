import { Language } from '../models/Language.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { normalizeItem, normalizeList } from '../utils/normalize.js';
import { todayKey } from '../utils/dateStats.js';

export const getLanguages = asyncHandler(async (req, res) => {
  const languages = await Language.find({ owner: req.user._id }).sort({ key: 1 });
  res.json({ success: true, data: normalizeList(languages) });
});

export const createLanguage = asyncHandler(async (req, res) => {
  const language = await Language.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, data: normalizeItem(language) });
});

export const updateLanguage = asyncHandler(async (req, res) => {
  const language = await Language.findOneAndUpdate(
    { key: req.params.key, owner: req.user._id },
    req.body,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: normalizeItem(language) });
});

export const updateLanguageProgress = asyncHandler(async (req, res) => {
  const language = await Language.findOne({ key: req.params.key, owner: req.user._id });
  if (!language) throw new ApiError('Language not found', 404);

  Object.assign(language, req.body);
  language.lastPractice = req.body.lastPractice || todayKey();
  language.entries.push({
    date: todayKey(),
    activity: req.body.activity || 'Practice',
    value: Number(req.body.todayProgress || 0),
  });
  await language.save();

  res.json({ success: true, data: normalizeItem(language) });
});

export const deleteLanguage = asyncHandler(async (req, res) => {
  const language = await Language.findOneAndDelete({ key: req.params.key, owner: req.user._id });
  if (!language) throw new ApiError('Language not found', 404);
  res.json({ success: true, data: { key: req.params.key } });
});
