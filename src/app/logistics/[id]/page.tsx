'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../utils/api';

 type Logistic = {
  id: string;
  title: string;
  purpose?: string;
  amount?: number;
  requestedBy?: string;
  sentTo?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  voucherName?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  status?: string;
};

export default function LogisticDetailsPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [data, setData] = useState<Logistic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api<Logistic>(`/logistics/${id}`);
        if (!alive) return; setData(res);
      } catch (e: any) {
        if (!alive) return; setError(e?.message || 'Failed to load request');
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const fmtNGN = (n?: number) => {
    const v = Number(n||0);
    return `₦${v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const fmtDate = (iso?: string) => { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; };
  const duration = useMemo(() => {
    if (!data?.dateFrom || !data?.dateTo) return '—';
    const df = new Date(data.dateFrom), dt = new Date(data.dateTo);
    if (isNaN(df.getTime()) || isNaN(dt.getTime())) return '—';
    const days = Math.max(1, Math.round((dt.getTime() - df.getTime()) / (1000*60*60*24)) + 1);
    return `${days} day${days>1?'s':''} (${fmtDate(data.dateFrom)} - ${fmtDate(data.dateTo)})`;
  }, [data]);

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Logistics" subtitle="Request details" />
          <div className="mt-4">
            <Link href="/logistics" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* Header block */}
          <Card className="p-6 lg:p-7">
            <h3 className="text-lg font-semibold text-gray-900">{data?.title || (loading ? 'Loading…' : '—')}</h3>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 text-[15px]">
              <div className="flex gap-2"><span className="text-gray-500 w-28">Purpose:</span><span className="text-gray-900">{data?.purpose || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Amount:</span><span className="text-gray-900">{fmtNGN(data?.amount)}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">From:</span><span className="text-gray-900">{data?.requestedBy || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">To:</span><span className="text-gray-900">{data?.sentTo || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Duration:</span><span className="text-gray-900">{duration}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Status:</span><span className={"text-gray-900"}>{data?.status || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Attachment:</span><span className="text-gray-900">{data?.voucherName ? 'Yes' : 'No'}</span></div>
            </div>

            {/* Voucher/invoice preview placeholder */}
            <div className="mt-8 border-t pt-6">
              <div className="h-[560px] w-full bg-white border rounded-lg grid place-items-center text-gray-400">
                Attachment preview
              </div>
            </div>
          </Card>

          {/* Bottom Action bar */}
          <Card className="p-6 lg:p-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Action</label>
                <div className="relative">
                  <select className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option>Select action</option>
                    <option>Approve</option>
                    <option>Reject</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Remarks</label>
                <input className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm text-gray-700" placeholder="Enter remark" />
              </div>
              <div className="md:col-span-3">
                <button className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Submit</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
