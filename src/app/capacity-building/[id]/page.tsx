'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../utils/api';


type Training = {
  id: string;
  description: string;
  trainingType?: string;
  duration?: string;
  mode?: string;
  date: string;
  staff?: string[];
  status?: 'To-do' | 'Inprogress' | 'Completed' | string;
};

export default function CapacityDetailsPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [data, setData] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    let alive = true; setLoading(true);
    (async () => {
      try { const r = await api<Training>(`/trainings/${id}`); if (!alive) return; setData(r); setNewStatus(r.status || 'To-do'); }
      catch (e:any) { if (!alive) return; setError(e?.message || 'Failed to load'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const statusClass = (s?: string) => s === 'Completed' ? 'text-emerald-600' : s === 'Inprogress' ? 'text-amber-600' : 'text-gray-600';

  async function updateStatus() {
    if (!newStatus) return;
    setUpdating(true);
    try { await api(`/trainings/${id}/status`, { method: 'POST', body: JSON.stringify({ status: newStatus }) }); setData((d)=> d ? { ...d, status: newStatus } : d); }
    catch (e:any) { alert(e?.message || 'Failed to update'); }
    finally { setUpdating(false); }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Capacity Building" subtitle="Create and submit request for staff training" />
          <div className="mt-4">
            <Link href="/capacity-building" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-lg font-semibold text-gray-900">{data?.description || (loading ? 'Loading…' : '—')}</h3>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}

            {/* Meta grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-gray-600">Training type</div>
                <div className="mt-1 font-semibold text-gray-900">{data?.trainingType || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Training duration</div>
                <div className="mt-1 font-semibold text-gray-900">{data?.duration || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Training mode</div>
                <div className="mt-1 font-semibold text-gray-900">{data?.mode || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Training status</div>
                <div className={`mt-1 font-semibold ${statusClass(data?.status)}`}>{data?.status || 'To-do'}</div>
              </div>
            </div>

            {/* Participants */}
            <div className="mt-8">
              <div className="text-gray-900 font-medium mb-3">Training participant</div>
              <div className="text-sm text-gray-800 space-y-2">
                {(data?.staff || []).length === 0 ? (
                  <div className="text-gray-500">No participants listed</div>
                ) : (
                  (data?.staff || []).map((name, i) => (
                    <div key={i}>{i + 1}. {name}</div>
                  ))
                )}
              </div>
            </div>

            {/* Update status */}
            <div className="mt-10 flex items-center gap-4">
              <div className="w-full max-w-[320px]">
                <label className="block text-sm text-gray-600 mb-2">Update status</label>
                <div className="relative">
                  <select value={newStatus} onChange={(e)=>setNewStatus(e.target.value)} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select option</option>
                    {['To-do','Inprogress','Completed'].map((s)=> <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <button onClick={updateStatus} disabled={updating || !newStatus} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{updating ? 'Updating…' : 'Update'}</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
