import axios from 'axios';
import { useAuthStore } from '../store/stores';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT & debug timing on every request
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };

  console.log(
    `%c[API REQ] 🚀 ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`,
    'color: #2563EB; font-weight: bold;',
    config.data ? { body: config.data } : ''
  );

  const stored = localStorage.getItem('vidyai-auth');
  if (stored) {
    const { token } = JSON.parse(stored)?.state || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 & debug response logging
api.interceptors.response.use(
  (res) => {
    const duration = Date.now() - (res.config?.metadata?.startTime || Date.now());
    console.log(
      `%c[API RES] ✅ ${res.config?.method?.toUpperCase()} ${res.config?.url} (${duration}ms) - Status: ${res.status}`,
      'color: #059669; font-weight: bold;',
      res.data
    );
    return res;
  },
  async (err) => {
    const duration = Date.now() - (err.config?.metadata?.startTime || Date.now());
    console.error(
      `%c[API ERR] ❌ ${err.config?.method?.toUpperCase()} ${err.config?.url} (${duration}ms):`,
      'color: #DC2626; font-weight: bold;',
      {
        code: err.code,
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      }
    );

    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const baseURL = import.meta.env.VITE_API_URL || '/api';
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        // Update token in Zustand and persistent storage
        useAuthStore.setState({ token: data.token });
        const stored = JSON.parse(localStorage.getItem('vidyai-auth') || '{}');
        if (stored.state) {
          stored.state.token = data.token;
          localStorage.setItem('vidyai-auth', JSON.stringify(stored));
        }
        err.config.headers.Authorization = `Bearer ${data.token}`;
        return api(err.config);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
