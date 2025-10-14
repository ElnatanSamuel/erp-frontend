'use client';

import { useEffect, useMemo, useState } from 'react';
import { useResource } from '@elnatan/better-state/react';
import { listStaff } from '../../state/staff';
import StaffListTable from './StaffListTable';

export default function StaffBrowser() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Create a stable resource per query/page/limit
  const res = useMemo(() => listStaff(debouncedQ, page, limit), [debouncedQ, page, limit]);
  const snap = useResource(res);
  const data = snap.data;

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const rows = items.map((u, i) => ({
    sn: String((page - 1) * limit + i + 1).padStart(2, '0'),
    name: u.name,
    role: '-',
    designation: u.email,
  }));

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500">{total} staff</div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search staff by name or email..."
            className="h-9 w-64 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="h-9 px-2 rounded-lg border border-gray-200 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <StaffListTable rows={rows} />

      <div className="flex items-center justify-end gap-2">
        <button
          className="h-8 px-3 rounded-md border border-gray-200 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <div className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </div>
        <button
          className="h-8 px-3 rounded-md border border-gray-200 text-sm disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
