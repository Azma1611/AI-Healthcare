import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';

const ReminderModal = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const [formData, setFormData] = useState(
    initialData || { title: '', description: '', time: '', priority: 'medium', date: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title) {
      onSubmit(formData);
      setFormData({ title: '', description: '', time: '', priority: 'medium', date: '' });
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
                Reminder Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Take medication"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details..."
                rows="2"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium"
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

export default function Reminders() {
  const { userData, darkMode, themeStyles, addReminder, editReminder, deleteReminder } = useUser();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');

  const reminders = userData.reminders || [];

  const handleAddReminder = (formData) => {
    addReminder(formData);
    setModalOpen(false);
  };

  const handleEditReminder = (reminderId, formData) => {
    editReminder(reminderId, formData);
    setEditingReminder(null);
  };

  const filteredReminders = useMemo(() => {
    if (filterPriority === 'all') return reminders;
    return reminders.filter((r) => r.priority === filterPriority);
  }, [reminders, filterPriority]);

  const sortedReminders = useMemo(() => {
    return [...filteredReminders].sort((a, b) => {
      // Sort by date and time
      if (a.date && b.date) {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA - dateB;
      }
      return 0;
    });
  }, [filteredReminders]);

  const priorityColors = {
    low: 'from-blue-500 to-cyan-500',
    medium: 'from-yellow-500 to-orange-500',
    high: 'from-red-500 to-pink-500',
  };

  const priorityIcons = {
    low: '🔵',
    medium: '🟡',
    high: '🔴',
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-slate-950' : themeStyles.pageBg} py-8 px-4`}
    >
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">🔔 Reminders</h1>
          <p className="text-base sm:text-lg opacity-90">Stay on top of your tasks and commitments</p>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div
            className={`mb-8 p-6 rounded-2xl ${
              darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterPriority('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterPriority === 'all'
                      ? 'bg-slate-600 text-white'
                      : darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  All ({reminders.length})
                </button>
                <button
                  onClick={() => setFilterPriority('high')}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    filterPriority === 'high'
                      ? 'bg-red-600 text-white'
                      : darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  🔴 High ({reminders.filter((r) => r.priority === 'high').length})
                </button>
                <button
                  onClick={() => setFilterPriority('medium')}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    filterPriority === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  🟡 Medium ({reminders.filter((r) => r.priority === 'medium').length})
                </button>
                <button
                  onClick={() => setFilterPriority('low')}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    filterPriority === 'low'
                      ? 'bg-blue-600 text-white'
                      : darkMode
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  🔵 Low ({reminders.filter((r) => r.priority === 'low').length})
                </button>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition whitespace-nowrap"
              >
                + Add Reminder
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reminders List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="space-y-3">
            {sortedReminders.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl ${
                  darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                }`}
              >
                <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {reminders.length === 0 ? 'No reminders yet. Add one to get started!' : 'No reminders match your filter.'}
                </p>
              </div>
            ) : (
              sortedReminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl border-l-4 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  } ${
                    reminder.priority === 'high'
                      ? 'border-l-red-500'
                      : reminder.priority === 'medium'
                      ? 'border-l-yellow-500'
                      : 'border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{priorityIcons[reminder.priority]}</span>
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {reminder.title}
                        </h3>
                      </div>

                      {reminder.description && (
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                          {reminder.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        {reminder.date && (
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            📅 {reminder.date}
                          </span>
                        )}
                        {reminder.time && (
                          <span className={`flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            🕐 {reminder.time}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            reminder.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                              : reminder.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                          }`}
                        >
                          {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReminder(reminder)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <ReminderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddReminder}
        title="Add New Reminder"
      />

      {editingReminder && (
        <ReminderModal
          isOpen={!!editingReminder}
          onClose={() => setEditingReminder(null)}
          onSubmit={(formData) => handleEditReminder(editingReminder.id, formData)}
          initialData={editingReminder}
          title="Edit Reminder"
        />
      )}
    </div>
  );
}
