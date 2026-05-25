import axios from 'axios';

/**
 * Pre-configured Axios instance.
 * – Base URL points to Vite dev proxy (/api → Flask :5000)
 * – Sends cookies automatically (httpOnly JWT)
 */
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,         // send httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor: surface error messages cleanly ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
