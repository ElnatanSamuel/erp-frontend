'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../utils/api';

 type Circular = {
  id: string;
  title: string;
  body?: string;
  sentFrom?: string;
  sentTo?: string;
  date?: string;
  type?: string;
};

export default function CircularDetailsPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [data, setData] = useState<Circular | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await api<Circular>(`/circulars/${id}`);
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Failed to load circular');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Circulars" subtitle="View circular details" />
          <div className="mt-4">
            <Link href="/circulars" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-lg font-semibold text-gray-900">{data?.title || (loading ? 'Loading…' : '—')}</h3>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
              <div>
                <div className="text-gray-500">Sent From</div>
                <div className="text-gray-900">{data?.sentFrom || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Sent To</div>
                <div className="text-gray-900">{data?.sentTo || '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="text-gray-900">{fmtDate(data?.date)}</div>
              </div>
              <div>
                <div className="text-gray-500">Circular Type</div>
                <div className="text-gray-900">{data?.type || '—'}</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-gray-500 text-sm mb-2">Body</div>
              <div className="whitespace-pre-wrap text-gray-800 leading-6 bg-white border border-gray-200 rounded-xl p-4">
                {data?.body || '—'}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
