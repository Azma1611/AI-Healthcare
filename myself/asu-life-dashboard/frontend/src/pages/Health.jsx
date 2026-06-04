import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '../components/AnimatedCard';
import { StatCard } from '../components/StatCard';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';

export const Health = () => {
  const { t } = useTranslation();
  const { userData, darkMode, themeStyles, updateWaterReminder, toggleMealComplete, addSleepEntry } = useUser();
  const { health } = userData;
  const [sleepDate, setSleepDate] = useState(new Date().toISOString().split('T')[0]);
  const [sleepHours, setSleepHours] = useState('');

  if (userData.user.name !== 'Yaso') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : themeStyles.pageBg} py-8 px-4 flex items-center justify-center`}>
        <AnimatedCard darkMode={darkMode} className="max-w-md">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🏥 Health Module
          </h2>
          <p className={`mt-4 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
            {t('health.onlyYaso', 'This module is only available for Yaso.')}
          </p>
        </AnimatedCard>
      </div>
    );
  }

  const sleepAvg = health.sleepTracker.length
    ? (health.sleepTracker.reduce((a, b) => a + b.hours, 0) / health.sleepTracker.length).toFixed(1)
    : '0.0';

  const handleAddSleepEntry = (event) => {
    event.preventDefault();
    const hours = Number(sleepHours);
    if (!sleepDate || Number.isNaN(hours) || hours <= 0) return;

    addSleepEntry({ date: sleepDate, hours });
    setSleepHours('');
    setSleepDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : themeStyles.pageBg} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-8 rounded-3xl backdrop-blur-md ${
            darkMode
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700'
              : `bg-gradient-to-r ${themeStyles.button}`
          } text-white`}
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">🏥 Health & Wellness</h1>
          <p className="text-base sm:text-lg opacity-90">{t('health.subtitle', 'Track your sleep, hydration, and nutrition')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon="💧"
            label="Water Today"
            value={health.waterReminder.completed}
            unit={`/ ${health.waterReminder.daily}`}
            progress={(health.waterReminder.completed / health.waterReminder.daily) * 100}
            color="from-blue-500 to-cyan-500"
            darkMode={darkMode}
          />
          <StatCard
            icon="😴"
            label="Avg Sleep"
            value={sleepAvg}
            unit="hrs"
            progress={(sleepAvg / 8) * 100}
            color="from-purple-500 to-pink-500"
            darkMode={darkMode}
          />
          <StatCard
            icon="🍽️"
            label="Meals"
            value={health.foodReminders.filter(f => f.completed).length}
            unit={`/ ${health.foodReminders.length}`}
            progress={(health.foodReminders.filter(f => f.completed).length / health.foodReminders.length) * 100}
            color="from-green-500 to-emerald-500"
            darkMode={darkMode}
          />
        </div>

        <AnimatedCard darkMode={darkMode} delay={0.1} className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            💧 Water Intake
          </h2>
          <div className="flex gap-2 mb-4">
            {Array.from({ length: health.waterReminder.daily }).map((_, idx) => (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateWaterReminder(idx + 1)}
                className={`flex-1 h-16 rounded-lg transition-all ${
                  idx < health.waterReminder.completed
                    ? 'bg-gradient-to-b from-blue-500 to-cyan-500'
                    : darkMode
                    ? 'bg-slate-700'
                    : 'bg-gray-300'
                }`}
              >
                {idx < health.waterReminder.completed ? (
                  <div className="flex items-center justify-center h-full text-white font-bold">💧</div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">{t('health.tap', 'Tap')}</div>
                )}
              </motion.button>
            ))}
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {health.waterReminder.completed} of {health.waterReminder.daily} glasses consumed
          </p>
        </AnimatedCard>

        <AnimatedCard darkMode={darkMode} delay={0.2} className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🍽️ Meal Reminders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {health.foodReminders.map((meal) => (
              <motion.button
                key={meal.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleMealComplete(meal.id)}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  meal.completed
                    ? 'border-green-500 bg-green-500 bg-opacity-10'
                    : darkMode
                    ? 'border-slate-600 bg-slate-700 bg-opacity-30'
                    : 'border-gray-300 bg-gray-100 bg-opacity-30'
                }`}
              >
                <div className="text-center">
                  <span className="text-3xl">{meal.meal === 'Breakfast' ? '🌅' : meal.meal === 'Lunch' ? '🌞' : '🌙'}</span>
                  <p className={`font-bold mt-2 ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                    {meal.meal}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {meal.time}
                  </p>
                  <span className="text-2xl mt-2">{meal.completed ? '✅' : '⭕'}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatedCard>

        <AnimatedCard darkMode={darkMode} delay={0.25} className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🛌 Add Sleep Entry
          </h2>
          <form onSubmit={handleAddSleepEntry} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="date"
              value={sleepDate}
              onChange={(e) => setSleepDate(e.target.value)}
              className={`rounded-2xl px-4 py-3 border ${darkMode ? 'border-slate-700 bg-slate-900/80 text-white' : 'border-slate-200 bg-white text-slate-800'} outline-none transition-all focus:ring-2 focus:ring-blue-400/30`}
            />
            <input
              type="number"
              step="0.1"
              min="0"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="Hours slept"
              className={`rounded-2xl px-4 py-3 border ${darkMode ? 'border-slate-700 bg-slate-900/80 text-white' : 'border-slate-200 bg-white text-slate-800'} placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-400/30`}
            />
            <button
              type="submit"
              className="rounded-2xl px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
            >
              {t('health.logSleepButton', 'Log Sleep')}
            </button>
          </form>
        </AnimatedCard>

        <AnimatedCard darkMode={darkMode} delay={0.3}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            😴 Sleep Tracker
          </h2>
          <div className="space-y-4">
            {health.sleepTracker.map((sleep, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>
                    {sleep.date}
                  </span>
                  <span className="font-bold">{sleep.hours} hrs</span>
                </div>
                <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(sleep.hours / 8) * 100}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${
                      sleep.hours >= 7
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : sleep.hours >= 5
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};
