'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { useResource } from '@elnatan/better-state/react';
import { login } from '../../state/auth';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { fromPromise } from '@elnatan/better-state/async';
import { useRouter } from 'next/navigation';
import { authClient } from '../../utils/authClient';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Check session after mount
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.session) {
          window.location.replace('/');
        }
      } catch {}
    };
    checkSession();
  }, [mounted]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await authClient.signIn.email({ email, password });
      window.location.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label className="block text-sm text-gray-600 mb-2">Email address</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter email address"
          required
        />
      </div>
      <div>
        <Label className="block text-sm text-gray-600 mb-2">Password</Label>
        <div className="relative">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            required
            className="pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <img src="/icons/eye.png" alt="Toggle password visibility" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between py-1">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" />
          Remember me
        </label>
      </div>
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
      >
        {loading ? 'Loading…' : 'Sign In'}
      </Button>
    </form>
  );
}
