'use client';

import { useEffect, useState } from 'react';
import { authClient } from '../../utils/authClient';
import { logout } from '../../state/auth';
import { Button } from '../ui/button';

export default function UserStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getMe()
      .then(({ data }) => {
        setUser(data?.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const onSignOut = async () => {
    try {
      await logout();
      window.location.replace('/auth/login');
    } catch {}
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="rounded border border-gray-700 p-3 text-sm flex items-center justify-between">
      <span>
        Signed in as {user.email || user.name || 'user'}
      </span>
      <Button className="bg-gray-700 hover:bg-gray-600" onClick={onSignOut}>Sign out</Button>
    </div>
  );
}
