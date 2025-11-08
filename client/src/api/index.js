import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://ai-interview-trainer-server.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Interview API calls
export const interviewAPI = {
  // Enhanced interview setup
  setupInterview: (config) => api.post('/interview/setup', config),
  startInterview: (difficulty) => api.post('/interview/start', { difficulty }), // Fixed: Use legacy endpoint
  getInterview: (interviewId) => api.get(`/interview/${interviewId}`),
  submitAnswer: (interviewId, answerData) => api.post(`/interview/${interviewId}/submit-answer`, answerData),
  completeInterview: (interviewId, resultData) => api.post(`/interview/${interviewId}/complete`, resultData),
  getExplanations: (interviewId) => api.get(`/interview/${interviewId}/explanations`),
  
  // Legacy endpoints (for backward compatibility)
  start: (difficulty) => api.post('/interview/start', { difficulty }),
  getQuestions: (interviewId) => api.get(`/interview/${interviewId}/questions`),
  getResults: (interviewId) => api.get(`/interview/${interviewId}/results`),
  getHistory: () => api.get('/interview/history'),
};

// Question API calls
export const questionAPI = {
  getAll: () => api.get('/questions'),
  getByDifficulty: (difficulty) => api.get(`/questions/${difficulty}`),
  add: (questionData) => api.post('/questions', questionData),
  update: (questionId, questionData) => api.put(`/questions/${questionId}`, questionData),
  delete: (questionId) => api.delete(`/questions/${questionId}`),
};

// Answer API calls
export const answerAPI = {
  get: (answerId) => api.get(`/answers/${answerId}`),
  updateFeedback: (answerId, feedbackData) => api.put(`/answers/${answerId}/feedback`, feedbackData),
  getByInterview: (interviewId) => api.get(`/answers/interview/${interviewId}`),
  delete: (answerId) => api.delete(`/answers/${answerId}`),
  getAverageScore: (interviewId) => api.get(`/answers/interview/${interviewId}/average-score`),
};

// Chatbot API calls
export const studyChatAPI = {
  sendMessage: (messageData) => api.post('/chatbot/send', messageData),
  testConnection: () => api.get('/chatbot/test'),
};

// Quiz API calls
export const quizAPI = {
  start: (quizData) => api.post('/quizzes/start', quizData),
  submitAnswer: (quizId, answerData) => api.post(`/quizzes/${quizId}/answer`, answerData),
  finish: (quizId) => api.post(`/quizzes/${quizId}/finish`),
  getUserQuizzes: (userId) => api.get(`/quizzes/user/${userId}`),
  getQuizResults: (quizId) => api.get(`/quizzes/${quizId}/results`),
};

// User API calls
export const userAPI = {
  getAll: () => api.get('/users'),
  delete: (userId) => api.delete(`/users/${userId}`),
};

export default api;
