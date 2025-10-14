'use client';

import LoginForm from '../../../components/auth/LoginForm';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: content */}
      <div className="flex min-h-screen flex-col bg-white px-10 lg:px-20 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div />
          <Link
            href="/auth/register"
            className="inline-flex items-center rounded-lg border border-blue-500 text-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-50"
          >
            Sign Up
          </Link>
        </div>

        {/* Centered content */}
        <div className="flex-1 flex">
          <div className="my-auto w-full max-w-[460px] mx-auto">
            <p className="text-sm text-gray-500">Welcome back!!</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">Please Sign In</h1>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      {/* Right: hero image */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/authimage.png"
          alt="Operations hero"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
