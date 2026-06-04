import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { useUser } from './context/UserContext';

import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { FloatingParticles } from './components/FloatingParticles';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Dashboard } from './pages/Dashboard';
import { Study } from './pages/Study';
import { Languages } from './pages/Languages';
import { Goals } from './pages/Goals';
import { Habits } from './pages/Habits';
import { Work } from './pages/Work';
import { Earnings } from './pages/Earnings';
import { Savings } from './pages/Savings';
import { Health } from './pages/Health';
import { Analytics } from './pages/Analytics';
import { Shared } from './pages/Shared';

import Reminders from './pages/Reminders';
import { Login } from './pages/Login';

import './App.css';

const AppContent = () => {
  const { darkMode, themeStyles } = useUser();

  return (
    <div
      className={`min-h-screen ${themeStyles?.pageBg || (darkMode ? 'bg-slate-950' : 'bg-slate-50')} pb-24 transition-colors duration-700 ease-in-out`}
    >
      <FloatingParticles particleStyle={themeStyles?.particle} />

      <Navigation />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:px-8">

        <div className="order-2 lg:order-1 w-full">
          <Sidebar />
        </div>

        <main className="relative z-10 order-1 w-full min-w-0 lg:order-2">

          <AnimatePresence mode="wait">
            <motion.div
              key={undefined}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
          <Routes>

            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/study" element={<Study />} />

            <Route path="/languages" element={<Languages />} />

            <Route path="/goals" element={<Goals />} />

            <Route path="/habits" element={<Habits />} />

            <Route path="/work" element={<Work />} />

            <Route path="/earnings" element={<Earnings />} />

            <Route path="/savings" element={<Savings />} />

            <Route path="/finances" element={<Savings />} />

            <Route path="/health" element={<Health />} />

            <Route path="/analytics" element={<Analytics />} />

            <Route path="/shared" element={<Shared />} />

            <Route path="/reminders" element={<Reminders />} />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

          </Routes>
            </motion.div>
          </AnimatePresence>

        </main>

      </div>

    </div>
  );
};

/*
========================================
APP
========================================
*/

function App() {
  return (
    <ThemeProvider>
      <UserProvider>

        <BrowserRouter>

          <Routes>

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />

          </Routes>

        </BrowserRouter>

      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
