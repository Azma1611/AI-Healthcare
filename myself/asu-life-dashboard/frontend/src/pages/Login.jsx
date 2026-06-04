import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, darkMode, toggleDarkMode, isAuthenticated, themeStyles } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-login check
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email: email.trim(), password: password.trim() });
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Your email or password is incorrect');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeStyles.pageBg} flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500`}>
      {/* Dark/Light Toggle */}
      <button
        onClick={toggleDarkMode}
        type="button"
        className="absolute top-6 right-6 rounded-full p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-md border border-slate-200/50 dark:border-slate-700 z-50 transition-colors duration-300"
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* Animated Background Elements */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-3xl"
      />

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full max-w-md ${themeStyles.card} rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] relative z-10`}
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`w-16 h-16 bg-gradient-to-br ${themeStyles.button} rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6`}
          >
            <span className="text-3xl">🔑</span>
          </motion.div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Welcome Back</h1>
          <p className={`text-sm mt-2 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Log in to your private couple dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-semibold mb-2 ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. asu@asu-yaso.app"
              className={`w-full rounded-2xl border ${darkMode ? 'border-slate-700 bg-slate-800/80 text-white placeholder-slate-500' : 'border-slate-200 bg-white/80 text-slate-800 placeholder-slate-400'} px-5 py-4 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ml-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="••••••••"
              className={`w-full rounded-2xl border ${darkMode ? 'border-slate-700 bg-slate-800/80 text-white placeholder-slate-500' : 'border-slate-200 bg-white/80 text-slate-800 placeholder-slate-400'} px-5 py-4 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span className="text-rose-500 text-lg">⚠️</span> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full relative mt-4 rounded-2xl bg-gradient-to-r ${themeStyles.button} px-6 py-4 text-base font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none overflow-hidden`}
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-indigo-600"
              >
                <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </motion.div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};