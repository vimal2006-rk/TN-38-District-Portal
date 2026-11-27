import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory access token (also synced to sessionStorage for reload continuity; refresh token lives in HttpOnly cookie)
let accessTokenMemory = sessionStorage.getItem('tmssa_access_token') || null;

export const setAccessToken = (token) => {
  accessTokenMemory = token || null;
  if (token) {
    sessionStorage.setItem('tmssa_access_token', token);
  } else {
    sessionStorage.removeItem('tmssa_access_token');
  }
};

export const getAccessToken = () => accessTokenMemory;

// Request interceptor: attach Bearer access token
api.interceptors.request.use(
  (config) => {
    const token = accessTokenMemory || sessionStorage.getItem('tmssa_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let browser set multipart boundary automatically when sending FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: automatically refresh expired access token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    const isAuthEndpoint =
      url.includes('/admin/auth/login') ||
      url.includes('/admin/auth/refresh') ||
      url.includes('/auth/login');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/admin/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.accessToken || res.data?.token;
        if (!newToken) throw new Error('No access token returned');

        setAccessToken(newToken);
        if (res.data?.user) {
          sessionStorage.setItem('tmssa_user', JSON.stringify(res.data.user));
        }

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        sessionStorage.removeItem('tmssa_user');
        localStorage.removeItem('tmssa_admin_hint');
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login?expired=1';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Coalesce identical concurrent GET requests (prevents duplicate network calls on StrictMode & rapid nav)
const inflightGets = new Map();
const rawGet = api.get.bind(api);

const buildGetKey = (url, config) => {
  if (!config?.params) return url;
  const entries = Object.entries(config.params)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b));
  return `${url}?${JSON.stringify(entries)}`;
};

api.get = (url, config) => {
  if (config?.skipDedupe || config?.signal || (config?.responseType && config.responseType !== 'json')) {
    return rawGet(url, config);
  }
  const key = buildGetKey(url, config);
  const existing = inflightGets.get(key);
  if (existing) return existing;

  const promise = rawGet(url, config).finally(() => {
    inflightGets.delete(key);
  });
  inflightGets.set(key, promise);
  return promise;
};

export default api;
