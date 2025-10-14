'use client';

import { useEffect, useState } from 'react';
import { authClient } from '../utils/authClient';

export function useClientSession() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only call useSession after mount to avoid SSR issues
  const session = mounted ? authClient.useSession() : { data: null, isPending: true, error: null };
  
  return session;
}
