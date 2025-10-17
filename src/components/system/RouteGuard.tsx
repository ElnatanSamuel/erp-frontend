'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '../../utils/authClient';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export default function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));
    if (isPublic) return;
    
    const checkAuth = async () => {
      try {
        const { data } = await authClient.getMe();
        if (!data?.user) {
          router.replace('/auth/login');
        }
      } catch {
        router.replace('/auth/login');
      }
    };
    
    checkAuth();
  }, [pathname, router]);

  return null;
}
