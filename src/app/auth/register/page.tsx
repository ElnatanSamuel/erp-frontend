import dynamicImport from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

const RegisterForm = dynamicImport(() => import('../../../components/auth/RegisterForm'), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  ),
});

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: content */}
      <div className="flex min-h-screen flex-col bg-white px-10 lg:px-20 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div />
          <Link
            href="/auth/login"
            className="inline-flex items-center rounded-lg border border-blue-500 text-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-50"
          >
            Sign In
          </Link>
        </div>

        {/* Centered content */}
        <div className="flex-1 flex">
          <div className="my-auto w-full max-w-[460px] mx-auto">
            <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-sm text-gray-500">Sign up to get started</p>
            <div className="mt-8">
              <RegisterForm />
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
