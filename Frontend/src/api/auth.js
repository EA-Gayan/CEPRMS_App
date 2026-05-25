import api from './axiosInstance';

/**
 * Phase 1 – Auth API calls
 */

export const authRegister = (payload) =>
  api.post('/auth/register', payload);

export const authLogin = (email, password) =>
  api.post('/auth/login', { email, password });

export const authLogout = () =>
  api.post('/auth/logout');

export const authMe = () =>
  api.get('/auth/me');
