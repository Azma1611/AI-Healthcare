import { motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';

const asuNavItems = [
  { id: 'dashboard', label: 'Home Dashboard', path: '/dashboard' },
  { id: 'study', label: 'Book Study', path: '/study' },
  { id: 'languages', label: 'Talk Languages', path: '/languages' },
  { id: 'goals', label: 'Goal Goals', path: '/goals' },
  { id: 'finances', label: 'Money Finances', path: '/finances', matches: ['/finances', '/savings'] },
  { id: 'habits', label: 'Check Habits', path: '/habits' },
  { id: 'reminders', label: 'Bell Reminders', path: '/reminders' },
  { id: 'shared', label: 'Heart Shared', path: '/shared' },
  { id: 'analytics', label: 'Chart Analytics', path: '/analytics' },
];

const yasoNavItems = [
  { id: 'dashboard', label: 'Home Dashboard', path: '/dashboard' },
  { id: 'work', label: 'Briefcase Work', path: '/work' },
  { id: 'earnings', label: 'Money Earnings', path: '/earnings' },
  { id: 'savings', label: 'PiggyBank Savings', path: '/savings' },
  { id: 'health', label: 'Heart Health', path: '/health' },
  { id: 'english', label: 'Talk English', path: '/languages', matches: ['/languages'] },
  { id: 'habits', label: 'Check Habits', path: '/habits' },
  { id: 'reminders', label: 'Bell Reminders', path: '/reminders' },
  { id: 'shared', label: 'Heart Shared', path: '/shared' },
  { id: 'analytics', label: 'Chart Analytics', path: '/analytics' },
];

const isItemActive = (item, pathname) => {
  const matches = item.matches || [item.path];
  return matches.includes(pathname);
};

export const Navigation = () => {
  const { t } = useTranslation();
  const {
    userData,
    darkMode,
    toggleDarkMode,
    themeStyles,
    logout,
  } = useUser();

  const navigate = useNavigate();
  const location = useLocation();
  const navItems = userData?.user?.name === 'Asu' ? asuNavItems : yasoNavItems;
  const mobileNavItems = navItems.slice(0, 5);

  const isAsu = userData?.user?.name === 'Asu';
  const userEmoji = isAsu ? '🌸' : '🌙';

  const inactiveClass = darkMode
    ? 'border-transparent bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
    : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800';

  const activeClass = darkMode
    ? `border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-md backdrop-blur-md`
    : `bg-indigo-600 text-white shadow-md border-transparent hover:bg-indigo-700`;

  const linkClass = ({ isActive }, item) => {
    const active = isActive || isItemActive(item, location.pathname);
    return `inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 ${active ? activeClass : inactiveClass}`;
  };

  const mobileLinkClass = ({ isActive }, item) => {
    const active = isActive || isItemActive(item, location.pathname);
    return `flex min-w-0 flex-1 items-center justify-center rounded-2xl px-2 py-2 text-xs font-semibold transition-all duration-300 ${
      active ? (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : 'text-slate-400 hover:text-slate-600'
    }`;
  };

  return (
    <nav
      className={`sticky top-0 z-40 border-b ${
        darkMode ? 'border-white/10 bg-slate-950/60 backdrop-blur-2xl' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] text-2xl shadow-lg backdrop-blur-md ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
              {userEmoji}
            </span>
            <div>
              <h1 className={`text-2xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Asu & Yaso Dashboard
              </h1>
              <p className={`text-sm mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700"
            >
              {darkMode ? t('dashboard.light') : t('dashboard.dark')}
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 bg-slate-950 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white shadow-lg"
            >
              {t('dashboard.logout')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pb-4 pt-1 lg:flex-nowrap lg:overflow-x-auto w-full max-w-full scrollbar-hide">
          {navItems.map((item) => (
            <motion.div key={item.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <NavLink to={item.path} className={(state) => linkClass(state, item)}>
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>
    </nav>
  );
};
