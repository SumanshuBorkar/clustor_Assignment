import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// User APIs
export const getUsers = () => api.get('/users');
export const getUserById = (userId) => api.get(`/users/${userId}`);

// Message APIs
export const getMessages = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (messageData) => api.post('/messages', messageData);
export const markMessagesAsRead = (userId) => api.put(`/messages/read/${userId}`);

export default api;