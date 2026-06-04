import { Health } from '../models/Health.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { normalizeItem } from '../utils/normalize.js';

const getOrCreateHealth = async (owner) =>
  Health.findOneAndUpdate(
    { owner },
    { $setOnInsert: { owner, waterReminder: { daily: 8, completed: 0 }, sleepTracker: [], foodReminders: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

export const getHealth = asyncHandler(async (req, res) => {
  const health = await getOrCreateHealth(req.user._id);
  res.json({ success: true, data: normalizeItem(health) });
});

export const updateWaterReminder = asyncHandler(async (req, res) => {
  const health = await getOrCreateHealth(req.user._id);
  const daily = Number(req.body.daily ?? health.waterReminder.daily);
  const completed = Math.max(0, Math.min(Number(req.body.completed ?? 0), daily));
  health.waterReminder = { daily, completed };
  await health.save();
  res.json({ success: true, data: normalizeItem(health) });
});

export const addSleepEntry = asyncHandler(async (req, res) => {
  const health = await getOrCreateHealth(req.user._id);
  health.sleepTracker.push(req.body);
  await health.save();
  res.status(201).json({ success: true, data: normalizeItem(health) });
});

export const toggleMeal = asyncHandler(async (req, res) => {
  const health = await getOrCreateHealth(req.user._id);
  const meal = health.foodReminders.id(req.params.mealId);
  if (!meal) throw new ApiError('Meal reminder not found', 404);
  meal.completed = !meal.completed;
  await health.save();
  res.json({ success: true, data: normalizeItem(health) });
});
