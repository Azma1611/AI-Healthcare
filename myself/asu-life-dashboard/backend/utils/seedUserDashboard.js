import { defaultDashboardData } from './defaultDashboardData.js';
import { Goal } from '../models/Goal.js';
import { Habit } from '../models/Habit.js';
import { Saving } from '../models/Saving.js';
import { Expense } from '../models/Expense.js';
import { Earning } from '../models/Earning.js';
import { Reminder } from '../models/Reminder.js';
import { Study } from '../models/Study.js';
import { Language } from '../models/Language.js';
import { Health } from '../models/Health.js';
import { WorkTask } from '../models/WorkTask.js';

const withOwner = (items, owner) => items.map((item) => ({ ...item, owner }));

export const seedUserDashboard = async (user) => {
  const defaults = defaultDashboardData[user.role];
  if (!defaults) return;

  const existingHabits = await Habit.countDocuments({ owner: user._id });
  if (existingHabits > 0) return;

  await Promise.all([
    Goal.insertMany(withOwner(defaults.goals || [], user._id)),
    Habit.insertMany(withOwner(defaults.habits || [], user._id)),
    Saving.insertMany(withOwner(defaults.savings || [], user._id)),
    Expense.insertMany(withOwner(defaults.expenses || [], user._id)),
    Earning.insertMany(withOwner(defaults.earnings || [], user._id)),
    Reminder.insertMany(withOwner(defaults.reminders || [], user._id)),
    WorkTask.insertMany(withOwner(defaults.workTasks || [], user._id)),
    Study.findOneAndUpdate(
      { owner: user._id },
      { ...defaults.study, owner: user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ),
    Health.findOneAndUpdate(
      { owner: user._id },
      { ...defaults.health, owner: user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ),
    Language.insertMany(withOwner(defaults.languages || [], user._id)),
  ]);
};
