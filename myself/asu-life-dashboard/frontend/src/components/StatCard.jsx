import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

export const StatCard = ({
  label,
  value,
  unit = '',
  progress = null,
  color,
  darkMode = false,
}) => {
  const { themeStyles } = useUser();
  const cardColor = color || themeStyles.progress || 'from-slate-500 to-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative min-h-[150px] overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 ${themeStyles?.card}`}
      whileHover={{ y: -4 }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={`text-xs font-bold uppercase tracking-[0.2em] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${cardColor}`} />
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </span>
        {unit && <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{unit}</span>}
      </div>

      {progress !== null && (
        <div className={`mt-6 h-2 w-full overflow-hidden rounded-full ${darkMode ? 'bg-black/40' : 'bg-black/5'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full bg-gradient-to-r ${cardColor}`}
          />
        </div>
      )}

      {/* Soft background glow */}
      <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-r ${cardColor} opacity-10 blur-2xl`} />
    </motion.div>
  );
};
