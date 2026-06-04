import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

export const ThemeModal = ({ open, onClose, themeOptions, selectedTheme, onSelectTheme }) => {
  const { darkMode } = useUser();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-4xl rounded-[2.5rem] border shadow-2xl backdrop-blur-2xl overflow-hidden ${darkMode ? 'border-white/10 bg-slate-950/90' : 'border-white/50 bg-white/90'}`}
      >
        <div className={`flex items-center justify-between gap-4 border-b px-8 py-6 ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div>
            <p className={`text-sm uppercase tracking-[0.2em] font-bold ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>Theme Settings</p>
            <h2 className={`text-3xl font-extrabold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Choose your dashboard style</h2>
          </div>
          <button
            onClick={onClose}
            className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all ${darkMode ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-black/10 bg-black/5 text-slate-900 hover:bg-black/10'}`}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-8">
          {themeOptions.map((theme) => (
            <button
              key={theme.key}
              onClick={() => onSelectTheme(theme.key)}
              className={`group relative overflow-hidden rounded-[2rem] border p-6 text-left transition-all duration-300 ${
                selectedTheme === theme.key
                  ? (darkMode ? 'border-sky-500 bg-white/10 shadow-[0_0_40px_rgba(14,165,233,0.2)]' : 'border-sky-500 bg-sky-50 shadow-[0_0_40px_rgba(14,165,233,0.2)]')
                  : (darkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-black/10 bg-black/5 hover:bg-black/10')
              }`}
            >
              <div className={`mb-5 h-28 rounded-2xl bg-gradient-to-r ${theme.preview} shadow-inner opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{theme.label}</p>
                  <p className={`mt-1 text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{theme.description}</p>
                </div>
                {selectedTheme === theme.key && (
                  <span className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    Selected
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
