import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api'; // Change to your backend URL

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
};

export const videoAPI = {
  getVideos: (params) => api.get('/videos', { params }),
  likeVideo: (id) => api.post(`/videos/${id}/like`),
  uploadVideo: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const commentAPI = {
  getComments: (videoId) => api.get(`/comments/${videoId}`),
  addComment: (videoId, text) => api.post(`/comments/${videoId}`, { text }),
};

export const profileAPI = {
  getProfile: (userId) => api.get(`/profile/${userId || ''}`),
  subscribe: (userId) => api.post(`/profile/${userId}/subscribe`),
};

export default api;