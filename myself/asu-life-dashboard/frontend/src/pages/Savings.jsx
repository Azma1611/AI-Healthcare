import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { StatCard } from '../components/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const expenseCategories = [
  'Food',
  'Travel',
  'Shopping',
  'Work',
  'Recharge',
  'Fuel',
  'Family',
  'Savings',
  'Other',
];

const SavingsModal = ({ isOpen, onClose, onSubmit, initialData, title, categoryOptions }) => {
  const [formData, setFormData] = useState(initialData || { amount: '', category: '', note: '', date: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.amount && !isNaN(formData.amount)) {
      onSubmit(formData);
      setFormData({ amount: '', category: '', note: '', date: '' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4"
        >
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{title}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              {categoryOptions?.length ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Choose purpose</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Salary, Bonus, Daily Saving"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Add a note..."
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const Savings = () => {
  const {
    userData,
    darkMode,
    themeStyles,
    addSavingsEntry,
    editSavingsEntry,
    deleteSavingsEntry,
    addExpense,
    editExpense,
    deleteExpense,
    getSavingsStats,
    getExpenseStats,
  } = useUser();

  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingSavings, setEditingSavings] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const savingsEntries = userData.savings.entries || [];
  const expenses = userData.expenses || [];

  const { totalSaved, weeklySavings, monthlySavings } = getSavingsStats();
  const { totalExpenses, weeklyExpenses, monthlyExpenses } = getExpenseStats();

  const balance = totalSaved - totalExpenses;
  const weeklyBalance = weeklySavings - weeklyExpenses;
  const monthlyBalance = monthlySavings - monthlyExpenses;

  const handleAddSavings = (formData) => {
    addSavingsEntry(formData.amount, formData.category, formData.note, formData.date);
    setSavingsModalOpen(false);
  };

  const handleEditSavings = (entryId, formData) => {
    editSavingsEntry(entryId, formData.amount, formData.category, formData.note, formData.date);
    setEditingSavings(null);
  };

  const handleAddExpense = (formData) => {
    addExpense(formData.amount, formData.category, formData.note, formData.date);
    setExpenseModalOpen(false);
  };

  const handleEditExpense = (expenseId, formData) => {
    editExpense(expenseId, formData.amount, formData.category, formData.note, formData.date);
    setEditingExpense(null);
  };

  // Sort entries by date (newest first)
  const sortedSavings = useMemo(() => {
    return [...savingsEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [savingsEntries]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses]);

  const expenseCategoryData = useMemo(() => {
    const totals = expenseCategories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    expenses.forEach((entry) => {
      const category = expenseCategories.includes(entry.category) ? entry.category : 'Other';
      totals[category] += Number(entry.amount) || 0;
    });

    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const spendingTrendData = useMemo(() => {
    const map = {};
    sortedExpenses.slice(0, 12).forEach((entry) => {
      const key = entry.date;
      map[key] = (map[key] || 0) + Number(entry.amount || 0);
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  }, [sortedExpenses]);

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-slate-950' : themeStyles.pageBg} py-8 px-4`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-8 rounded-3xl backdrop-blur-md ${
            darkMode
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700'
              : `bg-gradient-to-r ${themeStyles.button}`
          } text-white`}
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">🏦 Savings Tracker</h1>
          <p className="text-base sm:text-lg opacity-90">Manage your savings and expenses</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="💰"
            label="Total Balance"
            value={`${Math.abs(balance).toLocaleString()}`}
            unit="₹"
            color={balance >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'}
            darkMode={darkMode}
          />
          <StatCard
            icon="📅"
            label="Weekly Balance"
            value={`${Math.abs(weeklyBalance).toLocaleString()}`}
            unit="₹"
            color={weeklyBalance >= 0 ? 'from-blue-500 to-cyan-500' : 'from-orange-500 to-red-500'}
            darkMode={darkMode}
          />
          <StatCard
            icon="📈"
            label="Monthly Balance"
            value={`${Math.abs(monthlyBalance).toLocaleString()}`}
            unit="₹"
            color={monthlyBalance >= 0 ? 'from-purple-500 to-pink-500' : 'from-yellow-500 to-orange-500'}
            darkMode={darkMode}
          />
          <StatCard
            icon="💎"
            label="Total Saved"
            value={`${totalSaved.toLocaleString()}`}
            unit="₹"
            color="from-indigo-500 to-purple-500"
            darkMode={darkMode}
          />
        </div>

        {/* Savings and Expenses Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SAVINGS SECTION */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div
              className={`rounded-2xl p-6 ${
                darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  📊 Savings Entries ({savingsEntries.length})
                </h2>
                <button
                  onClick={() => setSavingsModalOpen(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
                >
                  + Add Saving
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedSavings.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No savings entries yet. Add one to get started!
                  </p>
                ) : (
                  sortedSavings.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                      } transition`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-green-500">+₹{entry.amount.toLocaleString()}</span>
                            <span className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                              {entry.category}
                            </span>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {entry.date} {entry.note && `• ${entry.note}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSavings(entry)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSavingsEntry(entry.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* EXPENSES SECTION */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div
              className={`rounded-2xl p-6 ${
                darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  🛒 Expenses ({expenses.length})
                </h2>
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
                >
                  + Add Expense
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedExpenses.length === 0 ? (
                  <p className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No expenses recorded yet. Add one to track spending!
                  </p>
                ) : (
                  sortedExpenses.map((expense) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'
                      } transition`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-red-500">-₹{expense.amount.toLocaleString()}</span>
                            <span className={`text-sm px-2 py-1 rounded ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                              {expense.category}
                            </span>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {expense.date} {expense.note && `• ${expense.note}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingExpense(expense)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Spending Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-8 p-6 rounded-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            📌 Expense Breakdown
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
            <div className="h-72 rounded-3xl bg-slate-900/5 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    fill="#8884d8"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={['#10b981', '#3b82f6', '#6366f1', '#f97316', '#ec4899', '#8b5cf6', '#0ea5e9', '#f59e0b', '#14b8a6'][index % 9]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderRadius: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-3xl p-4 bg-slate-900/5">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Top Spending Categories
              </h3>
              <div className="space-y-3">
                {expenseCategoryData.slice(0, 6).map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-2">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{item.name}</span>
                    <span className="font-semibold text-red-500">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
                {!expenseCategoryData.length && (
                  <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                    Add expenses to see spending categories and trends.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-8 p-6 rounded-2xl ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            📊 Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Saved</p>
              <p className="text-2xl font-bold text-green-500">₹{totalSaved.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Expenses</p>
              <p className="text-2xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Weekly Savings</p>
              <p className="text-2xl font-bold text-blue-500">₹{weeklySavings.toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Monthly Savings</p>
              <p className="text-2xl font-bold text-purple-500">₹{monthlySavings.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <SavingsModal
        isOpen={savingsModalOpen}
        onClose={() => setSavingsModalOpen(false)}
        onSubmit={handleAddSavings}
        title="Add Savings Entry"
      />

      {editingSavings && (
        <SavingsModal
          isOpen={!!editingSavings}
          onClose={() => setEditingSavings(null)}
          onSubmit={(formData) => handleEditSavings(editingSavings.id, formData)}
          initialData={editingSavings}
          title="Edit Savings Entry"
        />
      )}

      <SavingsModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSubmit={handleAddExpense}
        title="Add Expense"
        categoryOptions={expenseCategories}
      />

      {editingExpense && (
        <SavingsModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={(formData) => handleEditExpense(editingExpense.id, formData)}
          initialData={editingExpense}
          title="Edit Expense"
          categoryOptions={expenseCategories}
        />
      )}
    </div>
  );
};
