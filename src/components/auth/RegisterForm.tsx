'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authClient } from '../../utils/authClient';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const result = await authClient.register({ email, password, name });
      
      if (result?.token && result?.user) {
        // Successful registration, redirect to dashboard
        window.location.replace('/');
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label className="block text-sm text-gray-600 mb-2">Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
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
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
      >
        {loading ? 'Loading…' : 'Register'}
      </Button>
    </form>
  );
}
