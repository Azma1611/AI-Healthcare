import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Activity, 
  Award, 
  PiggyBank, 
  Flame, 
  Heart, 
  Droplet, 
  Coffee, 
  LogOut 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const Dashboard = () => {
  const { currentUser, userData, sharedData, darkMode, themeStyles } = useUser();
  const { t } = useTranslation();

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="w-full h-96 flex items-center justify-center text-slate-500 text-xl font-medium">
          Loading your personal workspace...
        </div>
      </DashboardLayout>
    );
  }

  const isAsu = currentUser.name === 'Asu';

  // 1. Today's Focus (Top pending Goal)
  const goalsList = userData.goals || [];
  const topGoal = goalsList.find(g => g.progress < 100) || goalsList[0] || {
    title: 'Set your first goal!',
    category: 'General',
    description: 'Add a goal to stay focused on your daily objectives.',
    progress: 0
  };

  // 2. Tasks Progress & Productivity Score
  const dailyTasks = userData.work?.dailyTasks || [];
  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const totalTasks = dailyTasks.length;
  const taskProgressText = totalTasks > 0 ? `${completedTasks} of ${totalTasks} completed` : 'No tasks assigned today';
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // 3. Savings Progress
  const savingsTarget = Number(userData.savings?.monthlyTarget || 15000);
  const totalSaved = userData.savings?.entries?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const savingsPercent = Math.min(Math.round((totalSaved / savingsTarget) * 100), 100);

  // 4. Habit Streak Summary
  const habitsList = userData.habits || [];
  const topHabits = habitsList.slice(0, 3);

  // 5. Couple Streak
  const coupleStreakValue = sharedData?.coupleStreak || 12;

  // 6. Health Summary
  const waterCompleted = userData.health?.waterReminder?.completed || 0;
  const waterTarget = userData.health?.waterReminder?.daily || 8;
  const sleepEntries = userData.health?.sleepTracker || [];
  const averageSleep = sleepEntries.length > 0 
    ? (sleepEntries.reduce((sum, s) => sum + Number(s.hours), 0) / sleepEntries.length).toFixed(1)
    : '7.2';

  // 7. Recent Activity (Completed goals/habits/tasks)
  const completedGoals = goalsList.filter(g => g.progress === 100).map(g => ({ type: 'goal', name: g.title, date: g.updatedAt }));
  const completedHabits = habitsList.filter(h => h.completed).map(h => ({ type: 'habit', name: h.name, date: h.updatedAt }));
  const completedWork = dailyTasks.filter(t => t.completed).map(t => ({ type: 'task', name: t.title, date: t.updatedAt }));
  const recentActivities = [...completedGoals, ...completedHabits, ...completedWork]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Banner */}
        <motion.div variants={itemVariants}>
          <div
            className={`rounded-[2rem] p-8 md:p-10 text-white shadow-xl bg-gradient-to-r ${
              isAsu
                ? 'from-indigo-600 via-indigo-500 to-violet-600 shadow-indigo-500/10'
                : 'from-violet-600 via-purple-600 to-indigo-600 shadow-purple-500/10'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] opacity-80 block mb-2">
              ASU & YASO DIGITAL WORKSPACE
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-3">
              Welcome back, {currentUser.name}! {isAsu ? '🌸' : '🌙'}
            </h1>
            <p className="text-base md:text-lg opacity-90 max-w-xl font-medium">
              Ready to crush your goals and track your habits today? Here is your daily overview.
            </p>
          </div>
        </motion.div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Today's Focus Card */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Today's Focus</span>
                  <Target className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-1`}>
                  {topGoal.title}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 mb-3 inline-block">
                  {topGoal.category}
                </span>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {topGoal.description}
                </p>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                  <span>Progress</span>
                  <span>{topGoal.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${topGoal.progress}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Tasks & Productivity Score */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Tasks Progress</span>
                  <CheckCircle className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-1`}>
                  Daily Assignments
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {taskProgressText}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" fill="transparent" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" className="text-indigo-600" fill="transparent"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - productivityScore / 100)}
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-800 dark:text-white">{productivityScore}%</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Productivity Score</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Based on work completed</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Savings Progress Card */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Savings Progress</span>
                  <PiggyBank className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-1`}>
                  Monthly target: ₹{savingsTarget.toLocaleString('en-IN')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Currently saved: ₹{totalSaved.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                  <span>Saved</span>
                  <span>{savingsPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${savingsPercent}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Habit Streaks Card */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Habit Streaks</span>
                  <Flame className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="space-y-3">
                  {topHabits.length === 0 ? (
                    <p className="text-sm text-slate-500">No active habits found.</p>
                  ) : (
                    topHabits.map(habit => (
                      <div key={habit.id || habit._id} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{habit.name}</span>
                        <div className="flex items-center gap-1 text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full text-xs font-bold">
                          <Flame className="h-3.5 w-3.5 fill-current" />
                          <span>{habit.streak}d</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Couple Streak Card */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 h-full flex flex-col items-center justify-center text-center">
              <div className="relative">
                <Heart className="h-16 w-16 text-indigo-500 fill-current animate-pulse mb-3" />
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-black mt-2">
                  {coupleStreakValue}
                </span>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'} mb-1`}>
                Relationship Streak
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {coupleStreakValue} days since we started planning together.
              </p>
            </GlassCard>
          </motion.div>

          {/* Health Summary Card */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Health Summary</span>
                  <Activity className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 text-indigo-500 mb-1">
                      <Droplet className="h-4 w-4 fill-current" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hydration</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                      {waterCompleted} / {waterTarget} cups
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 text-indigo-500 mb-1">
                      <Coffee className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sleep</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                      {averageSleep} hrs avg
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Recent Activity Log</span>
                <Award className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-slate-500 py-3">No recent activities completed yet today.</p>
                ) : (
                  recentActivities.map((act, index) => (
                    <div key={index} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                        <div>
                          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {act.name}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            Completed {act.type}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">
                        {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};