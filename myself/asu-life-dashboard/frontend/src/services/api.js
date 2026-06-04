import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  updateMe: (payload) => api.put('/auth/me', payload).then((res) => res.data),
};

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard').then((res) => res.data.data),
  getAnalytics: () => api.get('/analytics').then((res) => res.data.data),
};

const crud = (path) => ({
  list: () => api.get(path).then((res) => res.data.data),
  create: (payload) => api.post(path, payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`${path}/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`${path}/${id}`).then((res) => res.data.data),
});

export const goalsApi = crud('/goals');
export const savingsApi = crud('/savings');
export const expensesApi = crud('/expenses');
export const earningsApi = crud('/earnings');
export const remindersApi = crud('/reminders');
export const notesApi = crud('/notes');

export const habitsApi = {
  ...crud('/habits'),
  toggle: (id) => api.patch(`/habits/${id}/toggle`).then((res) => res.data.data),
};

export const workTasksApi = {
  ...crud('/work-tasks'),
  toggle: (id) => api.patch(`/work-tasks/${id}/toggle`).then((res) => res.data.data),
};

export const studyApi = {
  get: () => api.get('/study').then((res) => res.data.data),
  update: (payload) => api.put('/study', payload).then((res) => res.data.data),
  addSubject: (payload) => api.post('/study/subjects', payload).then((res) => res.data.data),
  updateSubject: (id, payload) => api.put(`/study/subjects/${id}`, payload).then((res) => res.data.data),
  addHours: (payload) => api.post('/study/hours', payload).then((res) => res.data.data),
};

export const languagesApi = {
  list: () => api.get('/languages').then((res) => res.data.data),
  create: (payload) => api.post('/languages', payload).then((res) => res.data.data),
  update: (key, payload) => api.put(`/languages/${key}`, payload).then((res) => res.data.data),
  updateProgress: (key, payload) => api.patch(`/languages/${key}/progress`, payload).then((res) => res.data.data),
  remove: (key) => api.delete(`/languages/${key}`).then((res) => res.data.data),
};

export const healthApi = {
  get: () => api.get('/health-data').then((res) => res.data.data),
  updateWater: (payload) => api.patch('/health-data/water', payload).then((res) => res.data.data),
  addSleep: (payload) => api.post('/health-data/sleep', payload).then((res) => res.data.data),
  toggleMeal: (id) => api.patch(`/health-data/meals/${id}/toggle`).then((res) => res.data.data),
};
