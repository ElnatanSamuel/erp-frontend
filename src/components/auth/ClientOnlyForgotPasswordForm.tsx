'use client';

import { useEffect, useState } from 'react';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function ClientOnlyForgotPasswordForm() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return <ForgotPasswordForm />;
}
