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
    (async () => {
      try {
        const session = await authClient.getSession();
        const hasUser = Boolean(session?.data?.user || session?.data?.session);
        if (!hasUser) router.replace('/auth/login');
      } catch {
        router.replace('/auth/login');
      }
    })();
  }, [pathname, router]);

  return null;
}
