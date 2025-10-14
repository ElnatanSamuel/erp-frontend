'use client';

import { Suspense } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StaffManager from '../../components/staff/StaffManager';

export const dynamic = 'force-dynamic';

function StaffContent() {
  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="All Staff" subtitle="View, search for and add new staff" />
        </div>
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <StaffManager />

          <footer className="text-center text-xs text-gray-400 pt-2 pb-6">
            Copyright © 2025 Relia Energy. All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense fallback={
      <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <StaffContent />
    </Suspense>
  );
}
