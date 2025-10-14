'use client';

import { useEffect } from 'react';
import { currentUser } from '../../state/auth';
import { setUser } from '../../state/store';
import { authClient } from '../../utils/authClient';

export default function AuthBootstrap() {
  useEffect(() => {
    const unsub = currentUser.subscribe((snap) => {
      // Keep app state user in sync with currentUser resource
      setUser(snap.data ?? null);
    });
    currentUser.refresh().catch(() => void 0);
    return () => unsub();
  }, []);

  // Also listen to Better Auth session and prefer it when present
  const { data: session } = authClient.useSession();
  useEffect(() => {
    if (session?.user) {
      const { id, email, name } = session.user as any;
      setUser({ id: id ?? 'session', email, name });
    } else {
      // If session ended, ensure app user is cleared
      setUser(null);
    }
  }, [session]);
  return null;
}
