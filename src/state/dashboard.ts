import { resource } from '@elnatan/better-state';
import { api } from '../utils/api';

export type DashboardSummary = {
  stats: {
    staffCount: number;
    applicationCount: number;
    projectsCount: number;
    departmentsCount: number;
    trendStaff?: string;
    trendApplications?: string;
    trendProjects?: string;
  };
  memos: { sn: string; title: string; from: string; to: string; status: string }[];
  payments: { sn: string; subject: string; date: string; status: string }[];
  staff: { sn: string; name: string; role: string; designation: string; photoUrl?: string }[];
};

export const dashboardSummary = resource<DashboardSummary>(async () => {
  return api<DashboardSummary>('/dashboard/summary');
});
