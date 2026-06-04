import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

export const UserSwitcher = () => {
  const { currentUserId, switchUser, darkMode, resetData } = useUser();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        className="flex gap-3 items-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <motion.button
          onClick={() => switchUser('asu')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all shadow-lg ${
            currentUserId === 'asu'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110'
              : darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-white text-gray-700 hover:bg-slate-100'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🌸 Asu
        </motion.button>

        <motion.button
          onClick={() => switchUser('yaso')}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-all shadow-lg ${
            currentUserId === 'yaso'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-110'
              : darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-white text-gray-700 hover:bg-slate-100'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🌙 Yaso
        </motion.button>

        <motion.button
          onClick={() => {
            if (window.confirm("Reset all data to defaults? This will restore the clever defaults.")) {
              resetData();
            }
          }}
          className={`p-3 rounded-full font-bold text-lg transition-all shadow-lg ${
            darkMode
              ? 'bg-slate-800 text-red-400 hover:bg-slate-700'
              : 'bg-white text-red-500 hover:bg-red-50'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Reset to defaults"
        >
          🔄
        </motion.button>
      </motion.div>
    </div>
  );
};
