import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tn38_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: redirect to /admin/login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tn38_token');
      localStorage.removeItem('tn38_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
