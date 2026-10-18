import axios from 'axios';
import { useAuthStore } from '../store/stores';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('vidyai-auth');
  if (stored) {
    const { token } = JSON.parse(stored)?.state || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
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
