import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: {
        loading: 'Loading Dashboard...',
        welcome: 'Welcome back, {{name}}!',
        ready: 'Your dashboard is ready 🚀',
        weeklyProductivity: 'Weekly Productivity',
        coupleStreak: 'Couple Streak',
        daysAndCounting: 'days and counting!',
        studyDashboard: 'STUDY DASHBOARD',
        focusDashboard: 'FOCUS DASHBOARD',
        asuWelcomeSub: 'Your study, habits, goals, and savings are ready for today.',
        yasoWelcomeSub: 'Your work tasks, habits, goals, and health stats are updated.',
        gpa: 'GPA',
        ai: 'AI',
        aiRobotics: 'AI/Robotics',
        lang: 'Lang',
        languages: 'Languages',
        save: 'Save',
        monthlySaved: 'Monthly Saved',
        tasks: 'Tasks',
        workProgress: 'Work Progress',
        score: 'Score',
        productivity: 'Productivity',
        health: 'Health',
        hydrationSleep: 'Hydration & Sleep',
        earned: 'Earned',
        monthlyEarnings: 'Monthly Earnings',
        title: "{{name}}'s Dashboard",
        subtitle: 'Planning, savings, habits and goals in one place.',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        logout: 'Logout',
      },
      health: {
        onlyYaso: 'This module is only available for Yaso.',
        logSleepButton: 'Log Sleep',
      },
      study: {
        onlyAsu: 'This module is only available for Asu.',
        currentGpa: 'Current GPA',
        subjects: 'Subjects',
        coursesSemester: 'courses this semester',
        avgAttendance: 'Avg Attendance',
        progress: 'Progress',
        addButton: 'Add',
      }
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
