'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Link from 'next/link';
import NewStaffForm from '../../../components/staff/NewStaffForm';

export default function NewStaffPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-[#F4F7FC] border-b border-gray-100">
          <DashboardHeader
            title="New Staff"
            subtitle="Create account for a new staff"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            }
          />
          <div className="mt-4">
            <Link href="/staff" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <NewStaffForm />
          <footer className="text-center text-xs text-gray-400 pt-2 pb-6">
            Copyright © 2025 Relia Energy. All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
  );
}
