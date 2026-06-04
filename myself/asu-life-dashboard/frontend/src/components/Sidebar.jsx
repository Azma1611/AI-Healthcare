import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

export const Sidebar = () => {
  const { userData, darkMode, currentUserId, currentTheme, themeStyles } = useUser();
  const isAsu = currentUserId === 'asu';
  const upcomingReminders = userData.reminders.slice(0, 4);
  const goals = userData.goals.slice(0, 4);
  const panelClass = themeStyles?.card;
  const insetClass = darkMode
    ? 'border-white/5 bg-white/5'
    : 'border-black/5 bg-black/5';

  return (
    <aside className="w-full space-y-5 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`space-y-5 text-left ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
      >
        <div className={`rounded-xl border p-5 shadow-sm backdrop-blur-xl ${panelClass}`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 text-2xl shadow-sm ring-1 ring-white/80">
              {userData.user.avatar || (isAsu ? '🌸' : '🌙')}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active User</p>
              <h2 className="mt-1 text-xl font-semibold">{userData.user.name || (isAsu ? 'Asu' : 'Yaso')}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl border p-4 ${insetClass}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Theme</p>
              <p className={`mt-1 text-sm font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${insetClass}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mood</p>
              <p className="mt-1 text-sm font-semibold">{isAsu ? 'Cozy planner' : 'Deep focus'}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-5 shadow-sm backdrop-blur-xl ${panelClass}`}>
          <h3 className="mb-4 text-base font-semibold">Reminders</h3>
          <div className="space-y-3">
            {upcomingReminders.length === 0 ? (
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                No reminders yet.
              </p>
            ) : (
              upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`rounded-xl border p-4 ${insetClass}`}
                >
                  <p className="text-sm font-medium leading-5">{reminder.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{reminder.date}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`rounded-xl border p-5 shadow-sm backdrop-blur-xl ${panelClass}`}>
          <h3 className="mb-4 text-base font-semibold">Today&apos;s Focus</h3>
          <div className="space-y-3">
            {goals.length === 0 ? (
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                No goals in progress. Add a new one to stay on track.
              </p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className={`rounded-xl border p-4 ${insetClass}`}>
                  <p className="text-sm font-semibold leading-5">{goal.title}</p>
                  <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200/80'}`}>
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{goal.progress || 0}% complete</p>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
