'use client';

import { useEffect, useState } from 'react';
import { useResource } from '@elnatan/better-state/react';
import { fromPromise } from '@elnatan/better-state/async';
import { dashboardSummary } from '../../state/dashboard';
import StatsGrid from './StatsGrid';
import MemoTable from './MemoTable';
import StaffListTable from './StaffListTable';
import PaymentsTable from './PaymentsTable';
import ApplicationsCard from './ApplicationsCard';

export default function DashboardLoader() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    
    dashboardSummary.refresh().catch(() => void 0);
    const unsub = dashboardSummary.subscribe((snap) => {
      if (snap.data) setData(snap.data);
    });
    
    return () => unsub();
  }, [mounted]);
  
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  return (
    <>
      <StatsGrid
        totals={data ? {
          staffCount: data.stats.staffCount,
          applicationCount: data.stats.applicationCount,
          projectsCount: data.stats.projectsCount,
          departmentsCount: data.stats.departmentsCount,
          trendStaff: data.stats.trendStaff,
          trendApplications: data.stats.trendApplications,
          trendProjects: data.stats.trendProjects,
        } : undefined}
      />
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <MemoTable rows={data?.memos} />
          <PaymentsTable rows={data?.payments} />
        </div>
        <div className="space-y-6">
          <StaffListTable rows={data?.staff} />
          <ApplicationsCard 
            approved={data?.applicationStats?.approved || 0}
            pending={data?.applicationStats?.pending || 0}
            rejected={data?.applicationStats?.rejected || 0}
          />
        </div>
      </div>
    </>
  );
}
