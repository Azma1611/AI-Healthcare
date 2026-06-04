import { Goal } from '../models/Goal.js';
import { Habit } from '../models/Habit.js';
import { Saving } from '../models/Saving.js';
import { Expense } from '../models/Expense.js';
import { Earning } from '../models/Earning.js';
import { Reminder } from '../models/Reminder.js';
import { Note } from '../models/Note.js';
import { Study } from '../models/Study.js';
import { Language } from '../models/Language.js';
import { Health } from '../models/Health.js';
import { WorkTask } from '../models/WorkTask.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { moneyStats } from '../utils/dateStats.js';
import { normalizeList } from '../utils/normalize.js';
import { seedUserDashboard } from '../utils/seedUserDashboard.js';

const keyedLanguages = (languages) =>
  languages.reduce((result, language) => {
    const plain = language.toObject();
    result[plain.key] = { ...plain, id: plain._id.toString() };
    delete result[plain.key]._id;
    delete result[plain.key].owner;
    return result;
  }, {});

const productivitySeries = [
  { day: 'Mon', asu: 78, yaso: 68 },
  { day: 'Tue', asu: 82, yaso: 74 },
  { day: 'Wed', asu: 70, yaso: 79 },
  { day: 'Thu', asu: 88, yaso: 72 },
  { day: 'Fri', asu: 85, yaso: 81 },
];

export const getDashboard = asyncHandler(async (req, res) => {
  await seedUserDashboard(req.user);

  const [
    goals,
    habits,
    savings,
    expenses,
    earnings,
    reminders,
    notes,
    study,
    languages,
    health,
    workTasks,
  ] = await Promise.all([
    Goal.find({ owner: req.user._id }).sort({ createdAt: -1 }),
    Habit.find({ owner: req.user._id }).sort({ createdAt: -1 }),
    Saving.find({ owner: req.user._id }).sort({ date: -1 }),
    Expense.find({ owner: req.user._id }).sort({ date: -1 }),
    Earning.find({ owner: req.user._id }).sort({ date: -1 }),
    Reminder.find({ owner: req.user._id }).sort({ date: 1 }),
    Note.find({ owner: req.user._id }).sort({ date: -1 }),
    Study.findOne({ owner: req.user._id }),
    Language.find({ owner: req.user._id }).sort({ key: 1 }),
    Health.findOne({ owner: req.user._id }),
    WorkTask.find({ owner: req.user._id }).sort({ createdAt: -1 }),
  ]);

  const completedTasks = workTasks.filter((task) => task.completed).length;
  const productivityScore = workTasks.length ? Math.round((completedTasks / workTasks.length) * 10) : 0;

  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        theme: req.user.theme,
      },
      goals: normalizeList(goals),
      habits: normalizeList(habits),
      savings: { entries: normalizeList(savings), currency: 'INR', monthlyTarget: 18000 },
      expenses: normalizeList(expenses),
      earnings: { entries: normalizeList(earnings), currency: 'INR' },
      reminders: normalizeList(reminders),
      shared: { notes: normalizeList(notes), calendar: [], memories: [], sharedGoals: [], coupleStreak: 0 },
      study: study || { currentSemester: 1, gpa: 0, subjects: [], attendance: [], hours: [], aiRobotics: {} },
      aiRobotics: study?.aiRobotics || { learningPath: [], currentLevel: 0, projects: [] },
      languages: keyedLanguages(languages),
      englishLearning: keyedLanguages(languages).english,
      health: health || { waterReminder: { daily: 8, completed: 0 }, sleepTracker: [], foodReminders: [] },
      work: { dailyTasks: normalizeList(workTasks), productivityScore },
    },
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const [savings, expenses, habits, study, workTasks] = await Promise.all([
    Saving.find({ owner: req.user._id }),
    Expense.find({ owner: req.user._id }),
    Habit.find({ owner: req.user._id }),
    Study.findOne({ owner: req.user._id }),
    WorkTask.find({ owner: req.user._id }),
  ]);

  const savingStats = moneyStats(savings);
  const expenseStats = moneyStats(expenses);
  const completedHabits = habits.filter((habit) => habit.completed).length;
  const completedTasks = workTasks.filter((task) => task.completed).length;
  const productivityScore = workTasks.length ? Math.round((completedTasks / workTasks.length) * 10) : 0;
  const studyProgress = study?.subjects?.length
    ? Math.round(study.subjects.reduce((sum, subject) => sum + Number(subject.progress || 0), 0) / study.subjects.length)
    : 0;

  res.json({
    success: true,
    data: {
      totalSavings: savingStats.total,
      monthlySavings: savingStats.monthly,
      weeklyExpenses: expenseStats.weekly,
      productivityScore,
      completedHabits,
      totalHabits: habits.length,
      studyProgress,
      productivityData: productivitySeries,
      savingsData: [],
      languageProgress: [],
    },
  });
});
