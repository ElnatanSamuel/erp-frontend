'use client';

import { useEffect } from 'react';
import { setUser } from '../../state/store';
import { authClient } from '../../utils/authClient';

export default function AuthBootstrap() {
  useEffect(() => {
    // Fetch user on mount
    const fetchUser = async () => {
      try {
        const { data } = await authClient.getMe();
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    
    fetchUser();
  }, []);

  return null;
}
