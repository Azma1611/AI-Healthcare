import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const lightStyles = {
  pageBg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-slate-50 to-blue-50/20',
  card: 'bg-white/85 backdrop-blur-md border border-slate-200/60 shadow-md shadow-slate-100/50',
  nav: 'bg-white/70 backdrop-blur-md border-b border-slate-200/50',
  button: 'from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/10',
  activeTab: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 rounded-full',
  inactiveTab: 'text-slate-600 hover:text-indigo-600',
  progress: 'from-indigo-600 to-violet-600',
  heroGlow: 'from-indigo-500/10 via-purple-500/10 to-blue-500/10',
  particle: 'bg-indigo-500/30',
  accent: 'text-indigo-600',
  chart: {
    line1: '#4f46e5',
    line2: '#06b6d4',
    grid: 'rgba(0, 0, 0, 0.05)',
    tick: '#64748b',
  },
};

const darkStyles = {
  pageBg: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black',
  card: 'bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl shadow-black/40',
  nav: 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80',
  button: 'from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-500/20',
  activeTab: 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 rounded-full',
  inactiveTab: 'text-slate-400 hover:text-white',
  progress: 'from-indigo-500 to-violet-500',
  heroGlow: 'from-indigo-500/20 via-purple-500/20 to-blue-500/20',
  particle: 'bg-indigo-400/20',
  accent: 'text-indigo-400',
  chart: {
    line1: '#818cf8',
    line2: '#22d3ee',
    grid: 'rgba(255, 255, 255, 0.05)',
    tick: '#94a3b8',
  },
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme_darkMode');
    return saved !== null ? JSON.parse(saved) : true; // Default to dark mode for rich aesthetics
  });

  useEffect(() => {
    localStorage.setItem('theme_darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const themeStyles = darkMode ? darkStyles : lightStyles;

  // Provide mock properties to prevent breaking legacy pages
  const currentTheme = { key: 'professional', label: 'Professional Mode' };
  const themeOptions = [currentTheme];
  const updateUserTheme = () => {};

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleDarkMode,
      themeStyles,
      currentTheme,
      themeOptions,
      updateUserTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);