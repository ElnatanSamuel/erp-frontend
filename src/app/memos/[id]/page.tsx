'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, API_ORIGIN } from '../../../utils/api';


type Memo = {
  id: string;
  title: string;
  sentFrom?: string;
  sentTo?: string;
  date?: string;
  hasAttachment?: boolean;
  type?: 'Sent' | 'Received' | string;
  action?: string;
  attachmentType?: string;
  body?: string;
  cc?: string[];
  attachmentName?: string;
  attachmentUrl?: string;
};

export default function MemoDetailsPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [data, setData] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api<Memo>(`/memos/${id}`);
        if (!alive) return; setData(res);
      } catch (e: any) {
        if (!alive) return; setError(e?.message || 'Failed to load memo');
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const fmtDate = (iso?: string) => { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; };
  const cc = useMemo(() => (Array.isArray(data?.cc) ? data!.cc : []), [data]);
  const attUrlAbs = useMemo(() => {
    const u = data?.attachmentUrl || '';
    if (!u) return '';
    return u.startsWith('http') ? u : `${API_ORIGIN}${u}`;
  }, [data]);
  const isPdf = attUrlAbs.toLowerCase().endsWith('.pdf');

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Create Memo" subtitle="Create and send memos to designated officers." />
          <div className="mt-4">
            <Link href="/memos" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-lg font-semibold text-gray-900">{data?.title || (loading ? 'Loading…' : '—')}</h3>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}

            {/* Meta rows */}
            <div className="mt-5 space-y-2 text-[15px]">
              <div className="flex gap-2"><span className="text-gray-500 w-28">Date:</span><span className="text-gray-900">{fmtDate(data?.date)}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">From:</span><span className="text-gray-900">{data?.sentFrom || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">To:</span><span className="text-gray-900">{data?.sentTo || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">CC1:</span><span className="text-gray-900">{cc[0] || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">CC2:</span><span className="text-gray-900">{cc[1] || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">CC3:</span><span className="text-gray-900">{cc[2] || '—'}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-28">Attachment:</span><span className="text-gray-900">{data?.hasAttachment ? 'Yes' : 'No'}</span></div>
            </div>

            {/* Message */}
            <div className="mt-6">
              <div className="text-gray-900 font-medium mb-2">Memo Message:</div>
              <p className="text-gray-700 leading-7 whitespace-pre-wrap">{data?.body || '—'}</p>
            </div>

            {/* Attachment preview */}
            <div className="mt-8 border-t pt-6">
              <div className="h-[560px] w-full bg-white border rounded-lg overflow-hidden">
                {!data?.attachmentUrl ? (
                  <div className="h-full w-full grid place-items-center text-gray-400">Attachment preview</div>
                ) : isPdf ? (
                  <iframe src={attUrlAbs} className="w-full h-full" />
                ) : (
                  <img src={attUrlAbs} alt={data?.attachmentName || 'Attachment'} className="max-h-full w-auto mx-auto" />
                )}
              </div>
              {data?.attachmentName && (
                <div className="mt-2 text-sm text-gray-600">Attachment: <a href={attUrlAbs} target="_blank" className="text-blue-600 hover:underline">{data.attachmentName}</a></div>
              )}
            </div>
          </Card>

          {/* Bottom action area */}
          <Card className="p-6 lg:p-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Action</label>
                <div className="relative">
                  <select className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option>Select action</option>
                    <option>Recommend for approval</option>
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
              <div className="md:col-span-3 flex items-center gap-6">
                <button className="ml-auto inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Submit</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
