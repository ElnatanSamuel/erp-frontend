'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { api } from '../../utils/api';

export default function StaffApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadData();
  }, [q, status, page]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api<{ items: any[]; total: number }>(
        `/staff-applications?q=${encodeURIComponent(q)}&status=${status}&page=${page}&limit=${limit}`
      );
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const fmtDate = (d: any) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Staff Applications" subtitle="Manage job applications" />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    className="h-11 w-64 rounded-xl border border-gray-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <Link
                href="/staff-applications/apply"
                className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
              >
                + New Application
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-5 py-3 font-medium">S/N</th>
                    <th className="px-5 py-3 font-medium">Full Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Position</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Applied Date</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-500">Loading...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-500">No applications found</td></tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-4">{String(idx + 1 + (page - 1) * limit).padStart(2, '0')}</td>
                        <td className="px-5 py-4 text-gray-900">{item.fullName}</td>
                        <td className="px-5 py-4">{item.email}</td>
                        <td className="px-5 py-4">{item.phone}</td>
                        <td className="px-5 py-4">{item.position || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                            item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            item.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">{fmtDate(item.appliedDate)}</td>
                        <td className="px-5 py-4">
                          <Link href={`/staff-applications/${item.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
