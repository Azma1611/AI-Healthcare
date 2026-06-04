import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AnimatedCard } from '../components/AnimatedCard';
import { useUser } from '../context/UserContext';

export const Analytics = () => {
  const { analyticsData, darkMode, themeStyles, userData } = useUser();
  const [selectedMetric, setSelectedMetric] = React.useState('productivity');

  const earningsEntries = userData.earnings?.entries || [];
  const expenses = userData.expenses || [];
  const savingsEntries = userData.savings?.entries || [];

  const lastSevenDays = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date.toISOString().split('T')[0];
    });
  }, []);

  const financeTrendData = useMemo(() => {
    const map = lastSevenDays.reduce((acc, date) => ({ ...acc, [date]: { date, income: 0, expense: 0 } }), {});
    earningsEntries.forEach((entry) => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (map[date]) map[date].income += Number(entry.amount || 0);
    });
    expenses.forEach((entry) => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (map[date]) map[date].expense += Number(entry.amount || 0);
    });
    return Object.values(map);
  }, [earningsEntries, expenses, lastSevenDays]);

  const expenseCategoryData = useMemo(() => {
    const categories = {};
    expenses.forEach((expense) => {
      const key = expense.category || 'Other';
      categories[key] = (categories[key] || 0) + Number(expense.amount || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const monthlySavingsData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - idx));
      return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), savings: 0 };
    });
    const monthMap = Object.fromEntries(months.map((item) => [`${item.year}-${item.month}`, item]));
    savingsEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${date.toLocaleString('default', { month: 'short' })}`;
      if (monthMap[key]) monthMap[key].savings += Number(entry.amount || 0);
    });
    return Object.values(monthMap);
  }, [savingsEntries]);

  const expenseTimeline = useMemo(
    () => [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8),
    [expenses]
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : themeStyles.pageBg} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-8 rounded-3xl backdrop-blur-md ${darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700' : `bg-gradient-to-r ${themeStyles.button}`} text-white`}
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
          <p className="text-base sm:text-lg opacity-90">Track your progress and growth</p>
        </motion.div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'productivity', label: '⚡ Productivity' },
            { id: 'savings', label: '💰 Savings' },
            { id: 'finance', label: '💵 Finance' },
            { id: 'language', label: '🌍 Language' },
          ].map((metric) => (
            <motion.button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all ${selectedMetric === metric.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : (darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700')}`}
              whileHover={{ scale: 1.05 }}
            >
              {metric.label}
            </motion.button>
          ))}
        </div>

        <AnimatedCard darkMode={darkMode} delay={0.1}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📈 Analytics
          </h2>
            {selectedMetric === 'productivity' && (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e5e7eb'} />
                    <XAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                    <YAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
                    <Legend />
                    <Bar dataKey="asu" fill="#a855f7" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="yaso" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {selectedMetric === 'savings' && (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.savingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e5e7eb'} />
                    <XAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                    <YAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
                    <Legend />
                    <Line type="monotone" dataKey="asu" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="yaso" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {selectedMetric === 'finance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financeTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e5e7eb'} />
                      <XAxis dataKey="date" stroke={darkMode ? '#94a3b8' : '#666'} />
                      <YAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseCategoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} fill="#6366f1" label />
                      {expenseCategoryData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={['#3b82f6', '#22c55e', '#f97316', '#ec4899', '#a855f7', '#0ea5e9', '#f59e0b', '#14b8a6'][index % 8]}
                        />
                      ))}
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {selectedMetric === 'language' && (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.languageProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e5e7eb'} />
                    <XAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                    <YAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', color: darkMode ? '#fff' : '#000' }} />
                    <Legend />
                    <Line type="monotone" dataKey="asu" stroke="#a855f7" strokeWidth={2} />
                    <Line type="monotone" dataKey="yaso" stroke="#06b6d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
        </AnimatedCard>
      </div>
    </div>
  );
};
