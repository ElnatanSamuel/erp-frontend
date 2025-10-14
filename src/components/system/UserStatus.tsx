'use client';

import { authClient } from '../../utils/authClient';
import { Button } from '../ui/button';

export default function UserStatus() {
  const { data: session, isPending } = authClient.useSession();

  const onSignOut = async () => {
    try {
      await authClient.signOut();
    } catch {}
  };

  if (isPending) return null;
  if (!session) return null;

  return (
    <div className="rounded border border-gray-700 p-3 text-sm flex items-center justify-between">
      <span>
        Signed in as {session.user?.email || session.user?.name || 'user'}
      </span>
      <Button className="bg-gray-700 hover:bg-gray-600" onClick={onSignOut}>Sign out</Button>
    </div>
  );
}
