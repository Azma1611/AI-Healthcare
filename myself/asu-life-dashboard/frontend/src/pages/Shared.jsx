import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '../components/AnimatedCard';
import { StatCard } from '../components/StatCard';
import { useUser } from '../context/UserContext';

export const Shared = () => {
  const { sharedData, darkMode, themeStyles, addSharedNote, updateSharedNote, deleteSharedNote, asuUserData, yasoUserData } = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const normalizeDate = (value) => {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  };

  const isSameWeek = (value, reference = new Date()) => {
    const date = normalizeDate(value);
    const ref = normalizeDate(reference);
    const startOfWeek = new Date(ref);
    startOfWeek.setDate(ref.getDate() - ref.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return date >= startOfWeek && date < endOfWeek;
  };

  const isSameMonth = (value, reference = new Date()) => {
    const date = normalizeDate(value);
    const ref = normalizeDate(reference);
    return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
  };

  const isSameDay = (value, reference = new Date()) => {
    const date = normalizeDate(value);
    const ref = normalizeDate(reference);
    return (
      date.getFullYear() === ref.getFullYear() &&
      date.getMonth() === ref.getMonth() &&
      date.getDate() === ref.getDate()
    );
  };

  const combinedExpenses = [...(asuUserData.expenses || []), ...(yasoUserData.expenses || [])];
  const combinedSavings = [...(asuUserData.savings?.entries || []), ...(yasoUserData.savings?.entries || [])];
  const combinedIncome = [...(asuUserData.earnings?.entries || []), ...(yasoUserData.earnings?.entries || [])];

  const totalCombinedExpenses = combinedExpenses.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const totalCombinedSavings = combinedSavings.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const totalCombinedIncome = combinedIncome.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const dailyExpense = combinedExpenses.reduce(
    (sum, entry) => (isSameDay(entry.date) ? sum + Number(entry.amount || 0) : sum),
    0
  );
  const weeklyExpense = combinedExpenses.reduce(
    (sum, entry) => (isSameWeek(entry.date) ? sum + Number(entry.amount || 0) : sum),
    0
  );
  const monthlyExpense = combinedExpenses.reduce(
    (sum, entry) => (isSameMonth(entry.date) ? sum + Number(entry.amount || 0) : sum),
    0
  );

  const expenseCategories = combinedExpenses.reduce((acc, entry) => {
    const category = entry.category || 'Other';
    acc[category] = (acc[category] || 0) + Number(entry.amount || 0);
    return acc;
  }, {});

  const recentSharedExpenses = [...combinedExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const balanceOverview = totalCombinedIncome - totalCombinedExpenses;

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
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">💕 Shared Space</h1>
          <p className="text-base sm:text-lg opacity-90">Together forever, building memories</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon="❤️"
            label="Couple Streak"
            value={sharedData.coupleStreak}
            unit="days"
            progress={Math.min((sharedData.coupleStreak / 500) * 100, 100)}
            color="from-rose-500 to-red-500"
            darkMode={darkMode}
          />
          <StatCard
            icon="🗓️"
            label="Shared Events"
            value={sharedData.calendar.length}
            color="from-pink-500 to-rose-500"
            darkMode={darkMode}
          />
          <StatCard
            icon="🎯"
            label="Shared Goals"
            value={sharedData.sharedGoals.length}
            color="from-purple-500 to-pink-500"
            darkMode={darkMode}
          />
        </div>

        <AnimatedCard darkMode={darkMode} delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Credited</p>
              <p className="text-3xl font-bold text-green-400">₹{totalCombinedIncome.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Expenses</p>
              <p className="text-3xl font-bold text-red-400">₹{totalCombinedExpenses.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Savings</p>
              <p className="text-3xl font-bold text-cyan-400">₹{totalCombinedSavings.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Remaining Balance</p>
              <p className={`text-3xl font-bold ${balanceOverview >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>₹{balanceOverview.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Daily Expense</p>
              <p className="text-xl font-semibold text-red-400">₹{dailyExpense.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Weekly Expense</p>
              <p className="text-xl font-semibold text-red-400">₹{weeklyExpense.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Expense</p>
              <p className="text-xl font-semibold text-red-400">₹{monthlyExpense.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(expenseCategories).slice(0, 6).map(([category, amount]) => (
              <div key={category} className={`p-4 rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{category}</p>
                <p className="text-lg font-semibold text-red-400">₹{amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </AnimatedCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Calendar */}
          <AnimatedCard darkMode={darkMode} delay={0.1}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🗓️ Upcoming Events
            </h2>
            <div className="space-y-4">
              {sharedData.calendar.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    event.color === 'pink'
                      ? 'border-pink-500 bg-pink-500 bg-opacity-10'
                      : event.color === 'red'
                      ? 'border-red-500 bg-red-500 bg-opacity-10'
                      : 'border-blue-500 bg-blue-500 bg-opacity-10'
                  }`}
                >
                  <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {event.event}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {event.date}
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Shared Goals */}
          <AnimatedCard darkMode={darkMode} delay={0.2}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🎯 Shared Goals
            </h2>
            <div className="space-y-4">
              {sharedData.sharedGoals.map((goal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <div className="flex justify-between mb-2">
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {goal.title}
                    </span>
                    <span className="font-bold">{goal.progress}%</span>
                  </div>
                  <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, delay: 0.1 + idx * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Daily Updates */}
        <AnimatedCard darkMode={darkMode} delay={0.3}>
          <div className="flex flex-col gap-6">
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📝 Daily Updates
              </h2>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Share what you and your partner did today. Add, edit, or delete updates.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!title.trim() || !content.trim()) return;

                addSharedNote({
                  id: Date.now(),
                  title: title.trim(),
                  content: content.trim(),
                  date: new Date().toLocaleDateString('en-GB'),
                });

                setTitle('');
                setContent('');
              }}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="What did you do today?"
                className="w-full glass rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write a short update for you and your boyfriend..."
                className="w-full glass rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button className="w-full gradient-glow rounded-lg py-3 text-white font-semibold hover:scale-105 transition">
                Add Update
              </button>
            </form>

            <div className="space-y-4">
              {sharedData.notes.length === 0 ? (
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  No updates yet — write your first daily recap together.
                </p>
              ) : (
                sharedData.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-3xl border ${darkMode ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/80'}`}
                  >
                    {editingId === note.id ? (
                      <div className="space-y-3">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full glass rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="w-full glass rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (!editTitle.trim() || !editContent.trim()) return;
                              updateSharedNote(note.id, {
                                title: editTitle.trim(),
                                content: editContent.trim(),
                              });
                              setEditingId(null);
                            }}
                            className="px-4 py-2 bg-rose-500 text-white rounded-xl"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-slate-500 rounded-xl text-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {note.title}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                              {note.date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(note.id);
                                setEditTitle(note.title);
                                setEditContent(note.content);
                              }}
                              className="px-3 py-1 rounded-lg bg-slate-700 text-white"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSharedNote(note.id)}
                              className="px-3 py-1 rounded-lg bg-red-500 text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className={`mt-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {note.content}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};
