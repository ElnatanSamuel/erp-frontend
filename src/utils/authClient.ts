import { createAuthClient } from 'better-auth/react';
const baseURLRaw = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:4000';
const baseURL = baseURLRaw.replace(/\/+$/, ''); // trim trailing slashes

const client = createAuthClient({ baseURL });

// helper to POST JSON with credentials
async function postJson(path: string, body: any) {
  const res = await fetch(`${baseURL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json().catch(() => undefined);
}
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
      return { data, error: null } as { data: any; error: null };
    } catch (e: any) {
      return { data: null, error: e } as { data: null; error: any };
    }
  },
  // Fallback signIn/signUp/signOut if the generated client doesn't include them
  signIn: (client as any)?.signIn ?? {
    email: async ({ email, password }: { email: string; password: string }) =>
      postJson('/api/auth/sign-in/email', { email, password }),
  },
  signUp: (client as any)?.signUp ?? {
    email: async ({ email, password, name }: { email: string; password: string; name?: string }) =>
      postJson('/api/auth/sign-up/email', { email, password, name }),
  },
  async signOut() {
    if (typeof (client as any).signOut === 'function') return (client as any).signOut();
    return postJson('/api/auth/sign-out', {});
  },
  useSession: () => {
    if (typeof window === 'undefined') {
      return { data: null, isPending: false, error: null };
    }
    return client.useSession();
  },
} as any;
