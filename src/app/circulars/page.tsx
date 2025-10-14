'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '../../components/ui/input';
import { api } from '../../utils/api';

 type CircularItem = {
  id: string;
  title: string;
  sentFrom?: string;
  sentTo?: string;
  date?: string;
  type?: string; // Sent | Received
};

export default function CircularsPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'All'|'Sent'|'Received'>('All');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(13);
  const [items, setItems] = useState<CircularItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (type !== 'All') params.set('type', type);
        params.set('page', String(page));
        params.set('limit', String(limit));
        const res = await api<{ items: CircularItem[]; total: number; page: number; limit: number }>(`/circulars?${params.toString()}`);
        if (!alive) return;
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Failed to load circulars');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [q, type, page, limit]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  function TypeBadge({ v }: { v?: string }) {
    const val = (v || '').toLowerCase();
    const isSent = val === 'sent' || val === '';
    return (
      <span className="inline-flex items-center gap-1 text-sm">
        {isSent ? (
          <>
            <span>Sent</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="currentColor"><path d="M14 3l7 7-1.41 1.41L15 7.83V21h-2V7.83l-4.59 4.58L7 10l7-7z"/></svg>
          </>
        ) : (
          <>
            <span>Received</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="currentColor"><path d="M10 21l-7-7 1.41-1.41L9 16.17V3h2v13.17l4.59-4.58L17 14l-7 7z"/></svg>
          </>
        )}
      </span>
    );
  }

  // Pagination window of 5 pages with >> to jump forward
  const [pageBlock, setPageBlock] = useState(0); // 0-based block index
  useEffect(() => { setPageBlock(Math.floor((page-1)/5)); }, [page]);
  const start = pageBlock * 5 + 1;
  const end = Math.min(pages, start + 5 - 1);

  function applySearch(ev: React.FormEvent) {
    ev.preventDefault();
    setPage(1);
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Circulars" subtitle="Search for and view all circulars" />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* Top controls */}
          <Card className="p-6 lg:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
              {/* Search */}
              <form onSubmit={applySearch} className="lg:col-span-5">
                <label className="block text-sm text-gray-600 mb-2">Quick search a circular</label>
                <div className="relative">
                  <Input placeholder="Enter search word" value={q} onChange={(e) => setQ(e.target.value)} className="pr-12 rounded-xl" />
                  <button aria-label="Search" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg grid place-items-center bg-blue-600 hover:bg-blue-700 text-white shadow" type="submit">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16a6.471 6.471 0 004.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM10 14a4 4 0 110-8 4 4 0 010 8z"/></svg>
                  </button>
                </div>
              </form>

              {/* Total */}
              <div className="lg:col-span-2 text-center">
                <div className="text-2xl font-semibold text-gray-900">{loading ? '—' : total}</div>
                <div className="text-sm text-gray-500">Total circulars</div>
              </div>

              {/* Filter */}
              <div className="lg:col-span-3">
                <label className="block text-sm text-gray-600 mb-2">Filter circulars</label>
                <div className="relative">
                  <select value={type} onChange={(e) => { setType(e.target.value as any); setPage(1); }} className="w-full h-12 appearance-none rounded-xl border-0 bg-gradient-to-br from-[#F2F6FF] to-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="All">All memos</option>
                    <option value="Sent">Sent</option>
                    <option value="Received">Received</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              {/* Create button */}
              <div className="lg:col-span-2 text-right">
                <Link href="/circulars/create" className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Create Circular</Link>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="p-0">
            <div className="p-5 pb-0 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">All Circulars</h3>
              <div className="text-sm text-gray-500">Showing
                <span className="ml-2 inline-flex items-center h-8 px-3 rounded-lg border border-gray-200 bg-white">{limit}</span>
                <span className="ml-1">per page</span>
              </div>
            </div>
            <div className="p-5 pt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-5 py-3 font-medium">S/N</th>
                    <th className="px-5 py-3 font-medium">Circular Title</th>
                    <th className="px-5 py-3 font-medium">Sent From</th>
                    <th className="px-5 py-3 font-medium">Sent To</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Circular Type</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-5 py-8 text-sm text-gray-500" colSpan={7}>Loading…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td className="px-5 py-8 text-sm text-gray-500" colSpan={7}>No circulars found</td></tr>
                  ) : (
                    items.map((r, i) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-4">{String((page-1)*limit + i + 1).padStart(2,'0')}</td>
                        <td className="px-5 py-4 text-gray-900">{r.title}</td>
                        <td className="px-5 py-4">{r.sentFrom || '—'}</td>
                        <td className="px-5 py-4">{r.sentTo || '—'}</td>
                        <td className="px-5 py-4">{fmtDate(r.date as any)}</td>
                        <td className="px-5 py-4"><TypeBadge v={r.type} /></td>
                        <td className="px-5 py-4 text-blue-600"><Link href={`/circulars/${r.id}`} className="hover:underline">View more</Link></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={(p===page? 'bg-blue-600 text-white':'bg-gray-100 text-gray-700')+ ' h-9 px-3 rounded-lg'}>{p}</button>
                ))}
                {end < pages && (
                  <button onClick={() => setPageBlock((b) => Math.min(b+1, Math.floor((pages-1)/5)))} className="h-9 px-3 rounded-lg bg-gray-100 text-gray-700">&gt;&gt;</button>
                )}
              </div>
            </div>
          </Card>
          <footer className="text-center text-xs text-gray-400 pt-2 pb-6">Copyright © 2025 Relia Energy. All Rights Reserved</footer>
          {error && <div className="text-sm text-rose-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
