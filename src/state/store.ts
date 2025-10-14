import { state } from '@elnatan/better-state';
import { persist } from '@elnatan/better-state/persist';
import type { User as TUser } from '../types';

export type Theme = 'light' | 'dark';
export type User = TUser | null;

export interface AppState {
  user: User;
  theme: Theme;
  loading: boolean;
}

const base = state<AppState>({ user: null, theme: 'light', loading: false });

// Use persist only in browser; on SSR/tests fall back to base state
export const appState = typeof window === 'undefined'
  ? base
  : persist(base, { key: 'app-store' });

export function setUser(user: User) {
  const s = appState.value;
  appState.set({ ...s, user });
}

export function setTheme(theme: Theme) {
  const s = appState.value;
  appState.set({ ...s, theme });
}

export function setLoading(loading: boolean) {
  const s = appState.value;
  appState.set({ ...s, loading });
}
