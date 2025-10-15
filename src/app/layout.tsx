import './globals.css';
import type { ReactNode } from 'react';
import AuthBootstrap from '../components/system/AuthBootstrap';
import RouteGuard from '../components/system/RouteGuard';

export const metadata = {
  title: 'ERP',
  description: 'ERP Monorepo Frontend',
};

// Force dynamic rendering for all pages to avoid SSR issues with Better Auth
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthBootstrap />
        <RouteGuard />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
