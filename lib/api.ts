'use client';
import axios from 'axios';
import { useAuth } from './store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// Attach Firebase ID token to every request
api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear the session and send the user to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      useAuth.getState().clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export function apiError(e: unknown, fallback = 'Something went wrong') {
  const msg = (e as any)?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0];
  return msg || fallback;
}
