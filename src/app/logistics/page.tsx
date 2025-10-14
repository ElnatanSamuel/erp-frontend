'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

 type LogisticItem = {
  id: string;
  title: string;
  purpose?: string;
  amount?: number;
  requestedBy?: string;
  sentTo?: string;
  date?: string;
  status?: 'Pending'|'Approved'|'Rejected'|string;
};

export default function LogisticsPage() {
  const [kpi, setKpi] = useState<{ total: number; totalAmount: number; pending: number; approved: number } | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'All'|'Pending'|'Approved'|'Rejected'>('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(13);
  const [items, setItems] = useState<LogisticItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => { try { const r = await api('/logistics/kpis'); setKpi(r as any); } catch {} })(); }, []);

  useEffect(() => {
    let alive = true; setLoading(true); setError(null);
    (async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (status !== 'All') params.set('status', status);
        params.set('page', String(page)); params.set('limit', String(limit));
        const r = await api<{ items: LogisticItem[]; total: number }>(`/logistics?${params.toString()}`);
        if (!alive) return; setItems(r.items || []); setTotal(r.total || 0);
      } catch (e: any) { if (!alive) return; setError(e?.message || 'Failed to load'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [q, status, page, limit]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const fmtCurrency = (n?: number) => (Number(n)||0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const fmtDate = (iso?: string) => { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; };

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Logistics" subtitle="Make and send logistics request." />
        </div>
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Card className="p-5 flex items-center gap-4"><div className="h-10 w-10 rounded-xl grid place-items-center bg-blue-50"><svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="currentColor"><path d="M3 3h18v6H3zM3 11h18v10H3z"/></svg></div><div><div className="text-2xl font-semibold text-gray-900">{kpi? kpi.total : '—'}</div><div className="text-sm text-gray-500">Total request made</div><div className="text-xs text-emerald-600 mt-1">↑ 50 more than last year</div></div></Card>
            <Card className="p-5 flex items-center gap-4"><div className="h-10 w-10 rounded-xl grid place-items-center bg-indigo-50"><svg viewBox="0 0 24 24" className="h-6 w-6 text-indigo-600" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7z"/></svg></div><div><div className="text-2xl font-semibold text-gray-900">{kpi? fmtCurrency(kpi.totalAmount) : '—'}</div><div className="text-sm text-gray-500">Total cost incurred</div></div></Card>
            <Card className="p-5 flex items-center gap-4"><div className="h-10 w-10 rounded-xl grid place-items-center bg-purple-50"><svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-600" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg></div><div><div className="text-2xl font-semibold text-gray-900">{kpi? kpi.pending : '—'}</div><div className="text-sm text-gray-500">Pending request</div></div></Card>
            <Card className="p-5 flex items-center gap-4"><div className="h-10 w-10 rounded-xl grid place-items-center bg-green-50"><svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="currentColor"><path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4z"/></svg></div><div><div className="text-2xl font-semibold text-gray-900">{kpi? kpi.approved : '—'}</div><div className="text-sm text-gray-500">Approved request</div><div className="text-xs text-rose-600 mt-1">↓ 2% more than last year</div></div></Card>
          </div>

          {/* Section header */}
          <Card className="p-6 lg:p-7 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Logistics request</h3>
            <Link href="/logistics/create" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Make Logistics Request</Link>
          </Card>

          {/* Table */}
          <Card className="p-0">
            <div className="p-5 pt-3 overflow-x-auto">
              <h3 className="text-base font-semibold text-gray-900 px-1 mb-2">All Logistics Request</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-5 py-3 font-medium">S/N</th>
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium">Purpose</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Requested By</th>
                    <th className="px-5 py-3 font-medium">Sent to</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-5 py-8 text-sm text-gray-500" colSpan={9}>Loading…</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td className="px-5 py-8 text-sm text-gray-500" colSpan={9}>No requests found</td></tr>
                  ) : (
                    items.map((r, i) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-4">{String((page-1)*limit + i + 1).padStart(2,'0')}</td>
                        <td className="px-5 py-4 text-gray-900">{r.title}</td>
                        <td className="px-5 py-4">{r.purpose || '—'}</td>
                        <td className="px-5 py-4">{fmtCurrency(r.amount)}</td>
                        <td className="px-5 py-4">{r.requestedBy || '—'}</td>
                        <td className="px-5 py-4">{r.sentTo || '—'}</td>
                        <td className="px-5 py-4">{fmtDate(r.date)}</td>
                        <td className="px-5 py-4">
                          {r.status === 'Approved' ? (
                            <span className="text-emerald-600">Approved</span>
                          ) : r.status === 'Pending' ? (
                            <span className="text-amber-600">Pending</span>
                          ) : (
                            <span className="text-rose-600">Rejected</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-blue-600"><Link href={`/logistics/${r.id}`} className="hover:underline">View more</Link></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: Math.max(1, Math.ceil(total/limit)) }, (_, i) => i + 1).slice(Math.max(0, page-3), Math.max(0, page-3)+5).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={(p===page? 'bg-blue-600 text-white':'bg-gray-100 text-gray-700')+ ' h-9 px-3 rounded-lg'}>{p}</button>
                ))}
              </div>
            </div>
          </Card>

          <footer className="text-center text-xs text-gray-400 pt-2 pb-6">Copyright © 2025 Relia Energy. All Rights Reserved</footer>
        </div>
      </div>
    </div>
  );
}
