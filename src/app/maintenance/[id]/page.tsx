'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, apiMultipart, API_ORIGIN } from '../../../utils/api';


type Maint = {
  id: string;
  title: string;
  description?: string;
  status: string;
  date: string;
  itemName?: string;
  itemNumber?: string;
  maintenanceType?: string;
  recurringOption?: string;
  attachmentName?: string;
  attachmentUrl?: string;
};

export default function MaintenanceDetailsPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [data, setData] = useState<Maint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let alive = true; setLoading(true);
    (async () => {
      try { const r = await api<Maint>(`/maintenance/${id}`); if (!alive) return; setData(r); }
      catch (e:any) { if (!alive) return; setError(e?.message || 'Failed to load'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const fmtDate = (iso?: string) => { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; };

  async function setStatus(status: string) {
    setUpdating(true);
    try { await api(`/maintenance/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }); setData((d)=> d? { ...d, status } : d); }
    catch (e:any) { alert(e?.message || 'Failed to update'); }
    finally { setUpdating(false); }
  }

  async function onAttachInvoice(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await apiMultipart<{ name: string; url: string }>(`/maintenance/upload`, fd);
      await api(`/maintenance/${id}/attachment`, { method: 'POST', body: JSON.stringify({ name: up.name, url: up.url }) });
      setData((d) => d ? { ...d, attachmentName: up.name, attachmentUrl: up.url } : d);
    } catch (e:any) {
      alert(e?.message || 'Failed to attach');
    } finally { setUploading(false); }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Scheduled Maintenance" subtitle="" />
          <div className="mt-4">
            <Link href="/maintenance" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 text-sm">
              <div>
                <div className="text-gray-600">Item name</div>
                <div className="mt-1 font-semibold text-gray-900">{data?.itemName || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Number</div>
                <div className="mt-1 font-semibold text-gray-900">{data?.itemNumber || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Date</div>
                <div className="mt-1 font-semibold text-gray-900">{fmtDate(data?.date)}</div>
              </div>
              <div>
                <div className="text-gray-600">Maintenance type</div>
                <div className="mt-1 font-semibold text-gray-900">{data?.maintenanceType || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Recurring type</div>
                <div className="mt-1 font-semibold text-gray-900">{data?.recurringOption || '—'}</div>
              </div>
              <div>
                <div className="text-gray-600">Status</div>
                <div className="mt-1">
                  <div className="relative inline-flex items-center">
                    <select
                      disabled={updating}
                      value={data?.status || 'Scheduled'}
                      onChange={(e)=>setStatus(e.target.value)}
                      className={"pr-8 appearance-none bg-transparent font-semibold " + (data?.status === 'Completed' ? 'text-emerald-600' : data?.status === 'Overdue' ? 'text-rose-600' : data?.status === 'Pending' ? 'text-amber-600' : 'text-gray-900')}
                    >
                      {['Scheduled','Completed','Pending','Overdue'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-1 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <input id="maint_invoice_input" type="file" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onAttachInvoice(f); e.currentTarget.value=''; }} />
              <button onClick={()=>document.getElementById('maint_invoice_input')?.click()} disabled={uploading}
                className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">
                {uploading ? 'Attaching…' : 'Attach Payment Invoice'}
              </button>
              {data?.attachmentName && (
                <div className="mt-2 text-sm text-gray-600">Attached: <a className="text-blue-600 hover:underline" href={(data.attachmentUrl||'').startsWith('http')? (data.attachmentUrl as string) : `${API_ORIGIN}${data.attachmentUrl}`} target="_blank">{data.attachmentName}</a></div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
