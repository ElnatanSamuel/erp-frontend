'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';


type MemoItem = {
  id: string;
  title: string;
  sentFrom?: string;
  sentTo?: string;
  date?: string;
  hasAttachment?: boolean;
  type?: 'Sent' | 'Received' | string;
};

export default function MemosPage() {
  const [kpi, setKpi] = useState<{ total: number } | null>(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState<'All' | 'Sent' | 'Received'>('All');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(16);
  const [items, setItems] = useState<MemoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { const r = await api('/memos/kpis'); setKpi(r as any); } catch {}
    })();
  }, []);

  useEffect(() => {
    let alive = true; setLoading(true); setError(null);
    (async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (type !== 'All') params.set('type', type);
        params.set('page', String(page)); params.set('limit', String(limit));
        const r = await api<{ items: MemoItem[]; total: number }>(`/memos?${params.toString()}`);
        if (!alive) return; setItems(r.items || []); setTotal(r.total || 0);
      } catch (e: any) { if (!alive) return; setError(e?.message || 'Failed to load'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [q, type, page, limit]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const fmtDate = (iso?: string) => { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; };

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Memo" subtitle="Create and send memos to designated officers." />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* KPIs and controls */}
          <Card className="p-6 lg:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-end">
              <div>
                <div className="text-3xl font-semibold text-gray-900">{kpi ? kpi.total : '—'}</div>
                <div className="text-sm text-gray-500">Total memo</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Quick search a memo</label>
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => { setPage(1); setQ(e.target.value); }}
                    placeholder="Enter search word"
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-700"
                  />
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                </div>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">Filter memo</label>
                  <div className="relative">
                    <select value={type} onChange={(e) => { setPage(1); setType(e.target.value as any); }} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                      <option>All</option>
                      <option>Sent</option>
                      <option>Received</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                  </div>
                </div>
                <Link href="/memos/create" className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Create Memo</Link>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="p-0">
            <div className="p-5 pt-3 overflow-x-auto">
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-base font-semibold text-gray-900">All Memos</h3>
                <div className="text-sm text-gray-500">Showing
                  <select value={limit} onChange={(e)=>{setPage(1); setLimit(Number(e.target.value)||16);}} className="mx-2 border rounded px-2 py-1 text-sm">
                    <option>16</option>
                    <option>32</option>
                    <option>48</option>
                  </select>
                  per page
                </div>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-5 py-3 font-medium">S/N</th>
                    <th className="px-5 py-3 font-medium">Memo Title</th>
                    <th className="px-5 py-3 font-medium">Sent From</th>
                    <th className="px-5 py-3 font-medium">Sent To</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Attachment?</th>
                    <th className="px-5 py-3 font-medium">Memo Type</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-5 py-8 text-sm text-gray-500" colSpan={8}>Loading…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td className="px-5 py-8 text-sm text-gray-500" colSpan={8}>No memos found</td></tr>
                  ) : (
                    items.map((r, i) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-4">{String((page-1)*limit + i + 1).padStart(2,'0')}</td>
                        <td className="px-5 py-4 text-gray-900">{r.title}</td>
                        <td className="px-5 py-4">{r.sentFrom || '—'}</td>
                        <td className="px-5 py-4">{r.sentTo || '—'}</td>
                        <td className="px-5 py-4">{fmtDate(r.date)}</td>
                        <td className="px-5 py-4">{r.hasAttachment ? 'Yes' : 'No'}</td>
                        <td className="px-5 py-4">{r.type || '—'}</td>
                        <td className="px-5 py-4 text-blue-600"><Link href={`/memos/${r.id}`} className="hover:underline">View more</Link></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page-3), Math.max(0, page-3)+5).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={(p===page? 'bg-blue-600 text-white':'bg-gray-100 text-gray-700')+ ' h-9 px-3 rounded-lg'}>{p}</button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
