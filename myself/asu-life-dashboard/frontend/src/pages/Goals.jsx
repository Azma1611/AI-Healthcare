import React from 'react';
import { useUser } from '../context/UserContext';
import { GlassCard } from '../components/ui/GlassCard';

export const Goals = () => {
  const { darkMode } = useUser();
  return (
    <div className="py-12 px-4 flex items-center justify-center">
      <GlassCard className="max-w-md w-full p-8 text-center">
        <span className="text-4xl mb-4 block">🎯</span>
        <h2 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Goal Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
          This module is being redesigned with milestone mapping and target milestones.
        </p>
        <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs uppercase tracking-wider">Coming Soon</span>
      </GlassCard>
    </div>
  );
};
