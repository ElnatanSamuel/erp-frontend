import { authClient } from '../utils/authClient';
import { setUser } from './store';

export async function logout() {
  // Clear app user immediately
  setUser(null);
  
  try {
    // Call logout endpoint and clear localStorage
    await authClient.logout();
  } catch {}
  
  return true;
}

// Emergency local reset
export function forceResetAuthClientSide() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('app-store');
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
