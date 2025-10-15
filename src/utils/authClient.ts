import { createAuthClient } from 'better-auth/react';

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:4000';

const client = createAuthClient({ baseURL });

// Create SSR-safe wrapper
export const authClient = {
  ...client,
  useSession: () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Return a mock session for SSR/build time
      return { data: null, isPending: false, error: null };
    }
    return client.useSession();
  },
};
