const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// JWT Auth Client
export const authClient = {
  async register({ email, password, name }: { email: string; password: string; name: string }) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }
    return res.json();
  },

  async login({ email, password }: { email: string; password: string }) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid credentials');
    }
    const data = await res.json();
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  async getMe() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return { data: null, error: new Error('No token') };

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) {
        return { data: null, error: new Error('Unauthorized') };
      }
      const data = await res.json();
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  async logout() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      }).catch(() => {});
      localStorage.removeItem('auth_token');
    }
    return { ok: true };
  },

  getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  },
};
