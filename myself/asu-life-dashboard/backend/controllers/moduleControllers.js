import { Goal } from '../models/Goal.js';
import { Habit } from '../models/Habit.js';
import { Saving } from '../models/Saving.js';
import { Expense } from '../models/Expense.js';
import { Earning } from '../models/Earning.js';
import { Reminder } from '../models/Reminder.js';
import { Note } from '../models/Note.js';
import { WorkTask } from '../models/WorkTask.js';
import { makeCrudController } from './crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { normalizeItem } from '../utils/normalize.js';

export const goalsController = makeCrudController(Goal);
export const habitsController = makeCrudController(Habit);
export const savingsController = makeCrudController(Saving, { sort: { date: -1 } });
export const expensesController = makeCrudController(Expense, { sort: { date: -1 } });
export const earningsController = makeCrudController(Earning, { sort: { date: -1 } });
export const remindersController = makeCrudController(Reminder, { sort: { date: 1 } });
export const notesController = makeCrudController(Note, { sort: { date: -1 } });
export const workTasksController = makeCrudController(WorkTask);

export const toggleHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.id, owner: req.user._id });
  if (!habit) throw new ApiError('Habit not found', 404);

  habit.completed = !habit.completed;
  habit.streak = habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1);
  habit.lastCompletedAt = habit.completed ? new Date() : undefined;
  await habit.save();

  res.json({ success: true, data: normalizeItem(habit) });
});

export const toggleWorkTask = asyncHandler(async (req, res) => {
  const task = await WorkTask.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) throw new ApiError('Work task not found', 404);

  task.completed = !task.completed;
  await task.save();

  res.json({ success: true, data: normalizeItem(task) });
});
