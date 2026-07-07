'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  clear: () => void;
}

/** Global auth store (Zustand) persisted to localStorage. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      clear: () => set({ user: null, token: null }),
    }),
    { name: 'pulse-auth' },
  ),
);
