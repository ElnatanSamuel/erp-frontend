'use client';

import Link from 'next/link';
import Card from '../dashboard/Card';
import { useEffect, useMemo, useState } from 'react';
import { useResource } from '@elnatan/better-state/react';
import { listStaff } from '../../state/staff';
import StaffTable from './StaffTable';

export default function StaffManager() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [role, setRole] = useState('All');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const res = useMemo(() => listStaff(`${debouncedQ}`, page, limit, role), [debouncedQ, page, limit, role]);
  const snap = useResource(res);
  const data = snap.data;

  const total = data?.total ?? 0;
  const items = data?.items ?? [];

  const rows = items.map((u: any, idx: number) => ({
    id: u.id,
    sn: String((page - 1) * limit + idx + 1).padStart(2, '0'),
    first: u.firstName || (u.name || '').split(' ')[0] || '',
    last: u.lastName || (u.name || '').split(' ').slice(1).join(' ') || '',
    gender: u.gender || '-',
    staffId: u.staffId || '-',
    phone: u.phone || '-',
    role: u.role || '-',
    designation: u.designation || '-',
    photoUrl: u.photoUrl || undefined,
  }));

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <Card className="p-6 md:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5">
            <div className="text-sm text-gray-500 mb-2">Quick search a staff</div>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter search word"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full border border-gray-200 bg-white text-gray-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="text-3xl font-semibold text-gray-900 leading-none">{total}</div>
            <div className="text-sm text-gray-500">Total number of staff</div>
          </div>

          <div className="lg:col-span-3">
            <div className="text-sm text-gray-500 mb-2">Filter staff</div>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setPage(1); }}
                className="w-full h-12 appearance-none rounded-xl border border-[#E8EEF7] bg-gradient-to-b from-white to-[#F5F8FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option>All</option>
                <option>Admin</option>
                <option>HR</option>
                <option>IT</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>

          <div className="lg:col-span-2 flex lg:justify-end">
            <Link href="/staff/new" className="inline-flex items-center justify-center w-full lg:w-auto h-12 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Add New Staff</Link>
          </div>
        </div>
      </Card>

      <StaffTable
        rows={rows}
        total={total}
        page={page}
        limit={limit}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </>
  );
}
