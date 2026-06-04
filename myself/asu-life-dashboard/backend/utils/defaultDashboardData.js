export const defaultDashboardData = {
  asu: {
    user: { name: 'Asu', avatar: '🌸', theme: 'pinkDream' },
    study: {
      currentSemester: 2,
      gpa: 8.9,
      subjects: [
        { name: 'AI Foundations', credits: 3, grade: 'A', progress: 84 },
        { name: 'Algorithms', credits: 4, grade: 'A+', progress: 92 },
        { name: 'Robotics Lab', credits: 2, grade: 'A', progress: 78 },
      ],
      attendance: [
        { subject: 'AI Foundations', percentage: 95 },
        { subject: 'Algorithms', percentage: 91 },
        { subject: 'Robotics Lab', percentage: 88 },
      ],
      hours: [
        { date: '2026-05-20', hours: 3 },
        { date: '2026-05-21', hours: 4 },
        { date: '2026-05-22', hours: 2.5 },
      ],
      aiRobotics: {
        learningPath: ['Sensors', 'Control Systems', 'Vision', 'Automation'],
        currentLevel: 2,
        projects: [
          { name: 'FlowerBot', type: 'AI', progress: 70 },
          { name: 'Smart Home Arm', type: 'Robotics', progress: 55 },
        ],
      },
    },
    languages: [
      { key: 'german', level: 'B1', dailyStreak: 12, wordsLearned: 780, speakingConfidence: 7, lastPractice: '2026-05-23', dailyGoal: 20, todayProgress: 16, entries: [{ date: '2026-05-23', activity: 'Listening', value: 1 }] },
      { key: 'english', level: 'C1', dailyStreak: 28, wordsLearned: 1420, speakingConfidence: 9, lastPractice: '2026-05-23', dailyGoal: 15, todayProgress: 15, entries: [{ date: '2026-05-23', activity: 'Speaking', value: 1 }] },
      { key: 'malayalam', level: 'A2', dailyStreak: 9, wordsLearned: 320, speakingConfidence: 6, lastPractice: '2026-05-22', dailyGoal: 10, todayProgress: 8, entries: [{ date: '2026-05-22', activity: 'Reading', value: 1 }] },
    ],
    savings: [
      { amount: 2000, category: 'Allowance', note: 'Part-time tutoring', date: '2026-05-20' },
      { amount: 1500, category: 'Gift', note: 'Birthday gift saved', date: '2026-05-22' },
    ],
    earnings: [
      { amount: 2500, source: 'Freelance', note: 'Graphic design', date: '2026-05-21' },
      { amount: 1200, source: 'Tutoring', note: 'German lesson', date: '2026-05-23' },
    ],
    expenses: [
      { amount: 650, category: 'Groceries', note: 'Cafe snacks', date: '2026-05-20' },
      { amount: 320, category: 'Transport', note: 'Campus bus', date: '2026-05-22' },
    ],
    goals: [
      { title: 'Finish German project', category: 'Study', description: 'Complete the German essay and presentation by Monday.', progress: 70, deadline: '2026-05-30', target: 'Essay + slides' },
      { title: 'AI summer internship prep', category: 'Career', description: 'Build robotics portfolio and prepare interview answers.', progress: 42, deadline: '2026-06-15', target: 'Portfolio ready' },
    ],
    habits: [
      { name: 'Matcha & morning reflection', streak: 18, completed: true },
      { name: 'Push 1 clean commit', streak: 5, completed: false },
      { name: 'Duolingo sprint', streak: 12, completed: true },
    ],
    reminders: [
      { title: 'German vocab review', date: '2026-05-24' },
      { title: 'Submit robotics report', date: '2026-05-25' },
    ],
    workTasks: [
      { title: 'Design AI model flow', completed: true },
      { title: 'Submit research notes', completed: false },
    ],
    health: {
      waterReminder: { daily: 8, completed: 5 },
      sleepTracker: [{ date: '2026-05-22', hours: 7.4 }, { date: '2026-05-23', hours: 6.8 }],
      foodReminders: [
        { meal: 'Breakfast', time: '08:30', completed: true },
        { meal: 'Lunch', time: '13:00', completed: false },
        { meal: 'Dinner', time: '20:30', completed: false },
      ],
    },
  },
  yaso: {
    user: { name: 'Yaso', avatar: '🌙', theme: 'skyBlue' },
    study: {
      currentSemester: 1,
      gpa: 8.1,
      subjects: [{ name: 'English Concepts', credits: 3, grade: 'A', progress: 90 }],
      attendance: [{ subject: 'English Concepts', percentage: 96 }],
      hours: [{ date: '2026-05-23', hours: 1.5 }],
      aiRobotics: { learningPath: ['Automation', 'IoT'], currentLevel: 1, projects: [{ name: 'Smart Budget Bot', type: 'Finance', progress: 40 }] },
    },
    languages: [
      { key: 'english', level: 'B2', dailyStreak: 14, wordsLearned: 920, speakingConfidence: 7, lastPractice: '2026-05-23', dailyGoal: 12, todayProgress: 10, entries: [{ date: '2026-05-23', activity: 'Conversation', value: 1 }] },
    ],
    savings: [
      { amount: 3000, category: 'Emergency', note: 'Buffer', date: '2026-05-22' },
      { amount: 1200, category: 'Travel', note: 'Weekend trip', date: '2026-05-23' },
    ],
    earnings: [
      { amount: 5200, source: 'Daily income', note: 'Freelance app', date: '2026-05-23' },
      { amount: 1800, source: 'Weekly bonus', note: 'Project milestone', date: '2026-05-20' },
    ],
    expenses: [
      { amount: 900, category: 'Food', note: 'Meal prep', date: '2026-05-22' },
      { amount: 1500, category: 'Utilities', note: 'Electricity bill', date: '2026-05-20' },
    ],
    goals: [{ title: 'Reach monthly savings', category: 'Finance', description: 'Save 15k while tracking daily income and spending.', progress: 62, deadline: '2026-05-31', target: '15000' }],
    habits: [
      { name: 'Hydration checkpoint', streak: 11, completed: true },
      { name: 'Expense check', streak: 8, completed: false },
    ],
    reminders: [
      { title: 'Run water reminder', date: '2026-05-24' },
      { title: 'Send expense summary', date: '2026-05-25' },
    ],
    workTasks: [
      { title: 'Client follow-up', completed: true },
      { title: 'Weekly report', completed: false },
      { title: 'Income forecast', completed: false },
    ],
    health: {
      waterReminder: { daily: 10, completed: 6 },
      sleepTracker: [{ date: '2026-05-22', hours: 7 }, { date: '2026-05-23', hours: 6.5 }],
      foodReminders: [
        { meal: 'Breakfast', time: '07:30', completed: true },
        { meal: 'Lunch', time: '13:15', completed: true },
        { meal: 'Dinner', time: '21:00', completed: false },
      ],
    },
  },
};
