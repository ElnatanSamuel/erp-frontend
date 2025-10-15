import { createAuthClient } from 'better-auth/react';

const baseURLRaw = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:4000';
const baseURL = baseURLRaw.replace(/\/+$/, ''); // trim trailing slashes

const client = createAuthClient({ baseURL });

// Create SSR-safe wrapper
export const authClient = {
  ...client,
  // Explicit session fetcher for places that call getSession()
  async getSession() {
    try {
      const res = await fetch(`${baseURL}/api/auth/get-session`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { data: null, error: new Error(text || `HTTP ${res.status}`) };
      }
      const data = await res.json();
      // Expected shape usage in code: session?.data?.user and session?.data?.session
      return { data, error: null } as { data: any; error: null };
    } catch (e: any) {
      return { data: null, error: e } as { data: null; error: any };
    }
  },
  useSession: () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Return a mock session for SSR/build time
      return { data: null, isPending: false, error: null };
    }
    return client.useSession();
  },
};
