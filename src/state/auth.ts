import { resource } from '@elnatan/better-state';
import { fromPromise } from '@elnatan/better-state/async';
import type { User } from '../types';
import { api } from '../utils/api';
import { authClient } from '../utils/authClient';
import { setUser } from './store';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function clearAllCookies() {
  if (typeof document === 'undefined') return;
  try {
    const cookies = document.cookie.split(';');
    const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
    const host = typeof window !== 'undefined' ? window.location.hostname : undefined;
    
    // Better Auth specific cookies to clear
    const betterAuthCookies = [
      'better-auth.session_token',
      'better-auth.csrf_token', 
      'better-auth.dontRememberToken',
      'better-auth.pkce_code_verifier',
    ];
    
    // Clear all cookies including Better Auth ones
    const allCookieNames = [...cookies.map(c => {
      const eqPos = c.indexOf('=');
      return (eqPos > -1 ? c.substr(0, eqPos) : c).trim();
    }), ...betterAuthCookies];
    
    for (const name of allCookieNames) {
      if (!name) continue;
      // Clear with various path and domain combinations
      document.cookie = `${name}=; expires=${past}; path=/`;
      document.cookie = `${name}=; expires=${past}; path=/; SameSite=Lax`;
      document.cookie = `${name}=; expires=${past}; path=/; SameSite=Strict`;
      document.cookie = `${name}=; expires=${past}; path=/; SameSite=None; Secure`;
      
      if (host) {
        document.cookie = `${name}=; expires=${past}; path=/; domain=${host}`;
        document.cookie = `${name}=; expires=${past}; path=/; domain=${host}; SameSite=Lax`;
        if (!host.startsWith('.')) {
          document.cookie = `${name}=; expires=${past}; path=/; domain=.${host}`;
          document.cookie = `${name}=; expires=${past}; path=/; domain=.${host}; SameSite=Lax`;
        }
      }
    }
  } catch {}
}

export const currentUser = resource<User | null>(async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await api<{ user: User }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.user;
  } catch {
    return null;
  }
});

export function login(email: string, password: string) {
  const r = fromPromise(
    (authClient.signIn.email({ email, password }) as Promise<unknown>).then(() => true)
  );
  r.subscribe((snap) => {
    if (snap.data) {
      // Cookies set by Better Auth; rehydrate user (legacy path guarded by token)
      currentUser.refresh();
    }
  });
  return r;
}

export function register(email: string, name: string, password: string) {
  const r = fromPromise(
    (authClient.signUp.email({ email, password, name }) as Promise<unknown>).then(() => true)
  );
  r.subscribe((snap) => {
    if (snap.data) {
      currentUser.refresh();
    }
  });
  return r;
}

export function logout() {
  const r = fromPromise((async () => {
    // Clear app user immediately
    setUser(null);
    
    try {
      // Call Better Auth signOut first
      await authClient.signOut();
    } catch {}
    
    // Aggressively clear all storage
    if (typeof window !== 'undefined') {
      try {
        // Clear all cookies (including Better Auth cookies)
        clearAllCookies();
        
        // Clear localStorage completely
        localStorage.clear();
        
        // Clear sessionStorage completely
        sessionStorage.clear();
        
        // Clear IndexedDB if any
        if (window.indexedDB) {
          try {
            const dbs = await window.indexedDB.databases();
            dbs.forEach((db) => {
              if (db.name) window.indexedDB.deleteDatabase(db.name);
            });
          } catch {}
        }
      } catch {}
    }
    
    // Ask backend to clear httpOnly cookies as well
    try { 
      await api('/auth/logout', { method: 'POST' }); 
    } catch {}
    
    try {
      await currentUser.refresh();
    } catch {}
    
    // Clear cookies one more time to be sure
    clearAllCookies();
    
    return true as const;
  })());
  return r;
}

// Emergency local reset if cookies persist due to wrong domain/origin
export function forceResetAuthClientSide() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('app-store');
      clearAllCookies();
    }
  } catch {}
  setUser(null);
}

export function initialsOf(name?: string | null) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase() || 'U';
}
