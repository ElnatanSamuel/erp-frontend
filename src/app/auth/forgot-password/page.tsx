import dynamicImport from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

const ForgotPasswordForm = dynamicImport(() => import('../../../components/auth/ForgotPasswordForm'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  ),
});

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
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
            <p className="text-sm text-gray-500">Password recovery.</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">Forgot your password?</h1>
            <p className="mt-2 text-sm text-gray-500">
              Kindly enter the email address linked to this account and we will send you a code to
              enable you change your password.
            </p>
            <div className="mt-8">
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>

      {/* Right: hero image */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/forgotpwdimage.png"
          alt="Forgot password hero"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
