import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Portfolio API
export const portfolioAPI = {
  // Portfolio Info
  getInfo: () => api.get('/portfolio/info'),
  updateInfo: (data) => api.put('/portfolio/info', data),

  // About
  getAbout: () => api.get('/portfolio/about'),
  updateAbout: (data) => api.put('/portfolio/about', data),

  // Skills
  getSkills: () => api.get('/portfolio/skills'),
  createSkill: (data) => api.post('/portfolio/skills', data),
  updateSkill: (id, data) => api.put(`/portfolio/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/portfolio/skills/${id}`),

  // Projects
  getProjects: (featured = null) => {
    const params = featured !== null ? { featured } : {};
    return api.get('/portfolio/projects', { params });
  },
  createProject: (data) => api.post('/portfolio/projects', data),
  updateProject: (id, data) => api.put(`/portfolio/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/portfolio/projects/${id}`),

  // Achievements
  getAchievements: () => api.get('/portfolio/achievements'),
  createAchievement: (data) => api.post('/portfolio/achievements', data),
  updateAchievement: (id, data) => api.put(`/portfolio/achievements/${id}`, data),
  deleteAchievement: (id) => api.delete(`/portfolio/achievements/${id}`),

  // Education
  getEducation: () => api.get('/portfolio/education'),
  createEducation: (data) => api.post('/portfolio/education', data),
  updateEducation: (id, data) => api.put(`/portfolio/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/portfolio/education/${id}`),

  // Languages
  getLanguages: () => api.get('/portfolio/languages'),
  createLanguage: (data) => api.post('/portfolio/languages', data),
  updateLanguage: (id, data) => api.put(`/portfolio/languages/${id}`, data),
  deleteLanguage: (id) => api.delete(`/portfolio/languages/${id}`)
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data)
};

// Contact API
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contacts'),
  markAsRead: (id) => api.put(`/contacts/${id}/read`)
};

// Upload API
export const uploadAPI = {
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getResumeUrl: () => `${API}/upload/resume`
};

export default api;
