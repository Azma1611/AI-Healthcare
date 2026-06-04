import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  authApi,
  dashboardApi,
  earningsApi,
  expensesApi,
  goalsApi,
  habitsApi,
  healthApi,
  languagesApi,
  notesApi,
  remindersApi,
  savingsApi,
  setAuthToken,
  studyApi,
  workTasksApi,
} from '../services/api';

const UserContext = createContext();

const demoAccounts = {
  asu: { email: 'asu@asu-yaso.app', password: 'AsuYaso123!' },
  yaso: { email: 'yaso@asu-yaso.app', password: 'YasoAsu123!' },
};

const todayKey = () => new Date().toISOString().split('T')[0];

const emptyDashboard = {
  user: { id: '', name: '', role: 'asu', avatar: '', theme: 'pinkDream' },
  goals: [],
  habits: [],
  savings: { entries: [], currency: 'INR', monthlyTarget: 18000 },
  expenses: [],
  earnings: { entries: [], currency: 'INR' },
  reminders: [],
  shared: { notes: [], calendar: [], memories: [], sharedGoals: [], coupleStreak: 0 },
  study: { currentSemester: 1, gpa: 0, subjects: [], attendance: [], hours: [] },
  aiRobotics: { learningPath: [], currentLevel: 0, projects: [] },
  languages: {},
  englishLearning: null,
  health: { waterReminder: { daily: 8, completed: 0 }, sleepTracker: [], foodReminders: [] },
  work: { dailyTasks: [], productivityScore: 0 },
};

const analyticsFallback = {
  productivityData: [
    { day: 'Mon', asu: 78, yaso: 68 },
    { day: 'Tue', asu: 82, yaso: 74 },
    { day: 'Wed', asu: 70, yaso: 79 },
    { day: 'Thu', asu: 88, yaso: 72 },
    { day: 'Fri', asu: 85, yaso: 81 },
  ],
  savingsData: [],
  languageProgress: [],
};

const normalizeDashboard = (dashboard) => ({
  ...emptyDashboard,
  ...dashboard,
  savings: { ...emptyDashboard.savings, ...(dashboard?.savings || {}) },
  earnings: { ...emptyDashboard.earnings, ...(dashboard?.earnings || {}) },
  shared: { ...emptyDashboard.shared, ...(dashboard?.shared || {}) },
  study: { ...emptyDashboard.study, ...(dashboard?.study || {}) },
  aiRobotics: dashboard?.aiRobotics || dashboard?.study?.aiRobotics || emptyDashboard.aiRobotics,
  languages: dashboard?.languages || {},
  health: { ...emptyDashboard.health, ...(dashboard?.health || {}) },
  work: { ...emptyDashboard.work, ...(dashboard?.work || {}) },
});

const parseAmount = (value) => Number(value || 0);

const isWithinDays = (dateValue, days) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return date >= start;
};

const getStats = (entries, totalKey, weeklyKey, monthlyKey) => {
  const total = entries.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const weekly = entries.filter((entry) => isWithinDays(entry.date, 7)).reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const monthly = entries.filter((entry) => isWithinDays(entry.date, 31)).reduce((sum, item) => sum + parseAmount(item.amount), 0);
  return { [totalKey]: total, [weeklyKey]: weekly, [monthlyKey]: monthly };
};

import { useTheme } from './ThemeContext';

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [userData, setUserData] = useState(emptyDashboard);
  const [analyticsData, setAnalyticsData] = useState(analyticsFallback);
  const [loading, setLoading] = useState(Boolean(token));
  const [authError, setAuthError] = useState('');
  const [localUser, setLocalUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('authUser'));
    } catch {
      return null;
    }
  });
  const themeContext = useTheme();

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        setLocalUser(JSON.parse(localStorage.getItem('authUser')));
      } catch {
        setLocalUser(null);
      }
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }, [token]);

  const refreshDashboard = async () => {
    const [dashboard, analytics] = await Promise.all([
      dashboardApi.getDashboard(),
      dashboardApi.getAnalytics().catch(() => analyticsFallback),
    ]);
    setUserData(normalizeDashboard(dashboard));
    setAnalyticsData({ ...analyticsFallback, ...analytics });
    return dashboard;
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    refreshDashboard()
      .catch(() => {
        setToken('');
        setUserData(emptyDashboard);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const currentUserId = localUser ? localUser.name.toLowerCase() : (userData.user?.role || 'asu');
  const activeUser = currentUserId;
  const currentUser = userData.user;

  const authenticate = async (credentials) => {
    setAuthError('');
    const response = await authApi.login(credentials);
    setToken(response.token);
    setAuthToken(response.token);
    localStorage.setItem('authUser', JSON.stringify(response.user));
    setLocalUser(response.user);
    window.dispatchEvent(new Event('auth-change'));
    await refreshDashboard();
    return response;
  };

  const register = async (payload) => {
    setAuthError('');
    const response = await authApi.register(payload);
    setToken(response.token);
    setAuthToken(response.token);
    localStorage.setItem('authUser', JSON.stringify(response.user));
    setLocalUser(response.user);
    window.dispatchEvent(new Event('auth-change'));
    await refreshDashboard();
    return response;
  };

  const switchUser = async (userKey) => {
    const account = demoAccounts[userKey];
    if (!account) return;
    try {
      await authenticate(account);
    } catch (error) {
      await register({ ...account, role: userKey });
    }
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setLocalUser(null);
      setToken('');
      setUserData(emptyDashboard);
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  const toggleDarkMode = async () => {
    themeContext.toggleDarkMode();
    try {
      const updated = await authApi.updateMe({ darkMode: !themeContext.darkMode });
      setUserData((prev) => ({ ...prev, user: { ...prev.user, ...updated.user } }));
    } catch (e) {}
  };

  const updateUserTheme = async (themeKey) => {
    themeContext.updateUserTheme(themeKey);
    try {
      const updated = await authApi.updateMe({ theme: themeKey });
      setUserData((prev) => ({ ...prev, user: { ...prev.user, ...updated.user } }));
    } catch (e) {}
  };

  const addSavingsEntry = async (amount, category, note, date) => {
    const entry = await savingsApi.create({ amount, category, note, date: date || todayKey() });
    setUserData((prev) => ({ ...prev, savings: { ...prev.savings, entries: [entry, ...prev.savings.entries] } }));
  };

  const editSavingsEntry = async (id, amount, category, note, date) => {
    const entry = await savingsApi.update(id, { amount, category, note, date });
    setUserData((prev) => ({
      ...prev,
      savings: { ...prev.savings, entries: prev.savings.entries.map((item) => (item.id === id ? entry : item)) },
    }));
  };

  const deleteSavingsEntry = async (id) => {
    await savingsApi.remove(id);
    setUserData((prev) => ({ ...prev, savings: { ...prev.savings, entries: prev.savings.entries.filter((item) => item.id !== id) } }));
  };

  const addExpense = async (amount, category, note, date) => {
    const expense = await expensesApi.create({ amount, category, note, date: date || todayKey() });
    setUserData((prev) => ({ ...prev, expenses: [expense, ...prev.expenses] }));
  };

  const editExpense = async (id, amount, category, note, date) => {
    const expense = await expensesApi.update(id, { amount, category, note, date });
    setUserData((prev) => ({ ...prev, expenses: prev.expenses.map((item) => (item.id === id ? expense : item)) }));
  };

  const deleteExpense = async (id) => {
    await expensesApi.remove(id);
    setUserData((prev) => ({ ...prev, expenses: prev.expenses.filter((item) => item.id !== id) }));
  };

  const addEarningsEntry = async (amount, source, note, date) => {
    const entry = await earningsApi.create({ amount, source, note, date: date || todayKey() });
    setUserData((prev) => ({ ...prev, earnings: { ...prev.earnings, entries: [entry, ...prev.earnings.entries] } }));
  };

  const editEarningsEntry = async (id, amount, source, note, date) => {
    const entry = await earningsApi.update(id, { amount, source, note, date });
    setUserData((prev) => ({
      ...prev,
      earnings: { ...prev.earnings, entries: prev.earnings.entries.map((item) => (item.id === id ? entry : item)) },
    }));
  };

  const deleteEarningsEntry = async (id) => {
    await earningsApi.remove(id);
    setUserData((prev) => ({ ...prev, earnings: { ...prev.earnings, entries: prev.earnings.entries.filter((item) => item.id !== id) } }));
  };

  const addReminder = async (reminderData) => {
    const reminder = await remindersApi.create({ ...reminderData, date: reminderData.date || todayKey() });
    setUserData((prev) => ({ ...prev, reminders: [...prev.reminders, reminder] }));
  };

  const editReminder = async (id, updatedReminder) => {
    const reminder = await remindersApi.update(id, updatedReminder);
    setUserData((prev) => ({ ...prev, reminders: prev.reminders.map((item) => (item.id === id ? reminder : item)) }));
  };

  const deleteReminder = async (id) => {
    await remindersApi.remove(id);
    setUserData((prev) => ({ ...prev, reminders: prev.reminders.filter((item) => item.id !== id) }));
  };

  const addGoal = async (goalData) => {
    const goal = await goalsApi.create(goalData);
    setUserData((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
  };

  const editGoal = async (id, updatedGoal) => {
    const goal = await goalsApi.update(id, updatedGoal);
    setUserData((prev) => ({ ...prev, goals: prev.goals.map((item) => (item.id === id ? goal : item)) }));
  };

  const deleteGoal = async (id) => {
    await goalsApi.remove(id);
    setUserData((prev) => ({ ...prev, goals: prev.goals.filter((item) => item.id !== id) }));
  };

  const addHabit = async (habitData) => {
    const habit = await habitsApi.create(habitData);
    setUserData((prev) => ({ ...prev, habits: [habit, ...prev.habits] }));
  };

  const toggleHabit = async (id) => {
    const habit = await habitsApi.toggle(id);
    setUserData((prev) => ({ ...prev, habits: prev.habits.map((item) => (item.id === id ? habit : item)) }));
  };

  const addWorkTask = async (taskData) => {
    const task = await workTasksApi.create(taskData);
    setUserData((prev) => ({ ...prev, work: { ...prev.work, dailyTasks: [task, ...prev.work.dailyTasks] } }));
  };

  const toggleWorkTask = async (id) => {
    const task = await workTasksApi.toggle(id);
    setUserData((prev) => ({
      ...prev,
      work: { ...prev.work, dailyTasks: prev.work.dailyTasks.map((item) => (item.id === id ? task : item)) },
    }));
  };

  const addStudySubject = async (subjectData) => {
    const study = await studyApi.addSubject(subjectData);
    setUserData((prev) => ({ ...prev, study, aiRobotics: study.aiRobotics || prev.aiRobotics }));
  };

  const updateLanguageProgress = async (languageKey, progressData) => {
    const language = await languagesApi.updateProgress(languageKey, progressData);
    const languages = { ...userData.languages, [languageKey]: language };
    setUserData((prev) => ({ ...prev, languages, englishLearning: languages.english }));
  };

  const updateWaterReminder = async (completed) => {
    const health = await healthApi.updateWater({ completed });
    setUserData((prev) => ({ ...prev, health }));
  };

  const toggleMealComplete = async (id) => {
    const health = await healthApi.toggleMeal(id);
    setUserData((prev) => ({ ...prev, health }));
  };

  const addSleepEntry = async (entry) => {
    const health = await healthApi.addSleep(entry);
    setUserData((prev) => ({ ...prev, health }));
  };

  const addSharedNote = async (noteData) => {
    const note = await notesApi.create({ ...noteData, date: todayKey() });
    setUserData((prev) => ({ ...prev, shared: { ...prev.shared, notes: [note, ...prev.shared.notes] } }));
  };

  const updateSharedNote = async (id, updatedNote) => {
    const note = await notesApi.update(id, updatedNote);
    setUserData((prev) => ({
      ...prev,
      shared: { ...prev.shared, notes: prev.shared.notes.map((item) => (item.id === id ? note : item)) },
    }));
  };

  const deleteSharedNote = async (id) => {
    await notesApi.remove(id);
    setUserData((prev) => ({ ...prev, shared: { ...prev.shared, notes: prev.shared.notes.filter((item) => item.id !== id) } }));
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    return Notification.requestPermission();
  };

  const resetData = refreshDashboard;

  const value = useMemo(() => ({
    activeUser,
    currentUserId,
    currentUser,
    isAuthenticated: Boolean(token),
    loading,
    authError,
    login: authenticate,
    register,
    switchUser,
    logout,
    refreshDashboard,
    userData,
    asuUserData: currentUserId === 'asu' ? userData : emptyDashboard,
    yasoUserData: currentUserId === 'yaso' ? userData : emptyDashboard,
    sharedData: userData.shared,
    analyticsData,
    ...themeContext,
    toggleDarkMode,
    updateUserTheme,
    addSavingsEntry,
    editSavingsEntry,
    deleteSavingsEntry,
    getSavingsStats: () => getStats(userData.savings.entries || [], 'totalSaved', 'weeklySavings', 'monthlySavings'),
    addExpense,
    editExpense,
    deleteExpense,
    getExpenseStats: () => getStats(userData.expenses || [], 'totalExpenses', 'weeklyExpenses', 'monthlyExpenses'),
    addEarningsEntry,
    editEarningsEntry,
    deleteEarningsEntry,
    getEarningsStats: () => getStats(userData.earnings.entries || [], 'totalEarnings', 'weeklyEarnings', 'monthlyEarnings'),
    addReminder,
    editReminder,
    deleteReminder,
    addGoal,
    editGoal,
    deleteGoal,
    addHabit,
    toggleHabit,
    addWorkTask,
    toggleWorkTask,
    addStudySubject,
    updateLanguageProgress,
    updateWaterReminder,
    toggleMealComplete,
    addSleepEntry,
    addSharedNote,
    updateSharedNote,
    deleteSharedNote,
    requestNotificationPermission,
    resetData,
  }), [userData, analyticsData, token, loading, authError, themeContext]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    console.warn('useUser was called outside of UserProvider. Returning safe fallback.');
    return {
      userData: emptyDashboard,
      themeStyles: {},
    };
  }
  return context;
};
