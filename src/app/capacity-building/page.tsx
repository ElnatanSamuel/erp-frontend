'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';


type Training = {
  id: string;
  description: string;
  trainingType?: string;
  duration?: string;
  mode?: string;
  date: string;
  staff?: string[];
  status?: string;
};

export default function CapacityBuildingPage() {
  const [kpis, setKpis] = useState<{ totalRequests: number; totalStaffTrained: number; totalTrainingDone: number; trainingRatePct: number }|null>(null);
  const [items, setItems] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => { try { const r = await api('/trainings/kpis'); setKpis(r as any); } catch {} })(); }, []);
  useEffect(() => {
    let alive = true; setLoading(true); setError(null);
    (async () => {
      try { const r = await api<{ items: Training[] }>(`/trainings`); if (!alive) return; setItems(r.items || []); }
      catch (e:any) { if (!alive) return; setError(e?.message || 'Failed to load'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Capacity Building" subtitle="Create and submit request for staff training" />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <KpiCard color="blue" value={kpis? kpis.totalRequests : '—'} label="Total training request"/>
            <KpiCard color="amber" value={kpis? kpis.totalStaffTrained : '—'} label="Total staff trained"/>
            <KpiCard color="purple" value={kpis? kpis.totalTrainingDone : '—'} label="Total training done"/>
            <KpiCard color="yellow" value={kpis? `${kpis.trainingRatePct}%` : '—'} label="Staff training rate"/>
          </div>

          {/* CTA */}
          <Card className="p-6 lg:p-7 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Training request</h3>
            <Link href="/capacity-building/request" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Make Training Request</Link>
          </Card>

          {/* Table */}
          <Card className="p-0">
            <div className="px-6 pt-5">
              <h3 className="text-base font-semibold text-gray-900">All Trainings</h3>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3">S/N</th>
                    <th className="px-6 py-3">Training Description</th>
                    <th className="px-6 py-3">Start Date</th>
                    <th className="px-6 py-3">Training Type</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Training Mode</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-6 py-10 text-gray-500" colSpan={8}>Loading…</td></tr>
                  ) : error ? (
                    <tr><td className="px-6 py-10 text-rose-600" colSpan={8}>{error}</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td className="px-6 py-10 text-gray-500" colSpan={8}>No trainings</td></tr>
                  ) : (
                    items.map((t, i) => (
                      <tr key={t.id} className="border-b last:border-b-0">
                        <td className="px-6 py-4 text-gray-500">{String(i+1).padStart(2,'0')}</td>
                        <td className="px-6 py-4 text-gray-900">{t.description}</td>
                        <td className="px-6 py-4 text-gray-700">{fmtDate(t.date)}</td>
                        <td className="px-6 py-4 text-gray-700">{t.trainingType || '—'}</td>
                        <td className="px-6 py-4 text-gray-700">{t.duration || '—'}</td>
                        <td className="px-6 py-4 text-gray-700">{t.mode || '—'}</td>
                        <td className="px-6 py-4">{renderStatus(t.status)}</td>
                        <td className="px-6 py-4"><Link className="text-blue-600 hover:underline" href={`/capacity-building/${t.id}`}>View more</Link></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          
        </div>
      </div>
    </div>
  );
}

function fmtDate(iso: string) { const d = new Date(iso); const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; }
function renderStatus(s?: string) {
  const text = s || 'To-do';
  const cls = text === 'Completed' ? 'text-emerald-600' : text === 'Inprogress' ? 'text-amber-600' : 'text-gray-600';
  return <span className={cls}>{text}</span>;
}
function KpiCard({ color, value, label }: { color: 'blue'|'amber'|'purple'|'yellow'; value: any; label: string }) {
  const map: any = { blue: 'text-blue-600 bg-blue-50', amber: 'text-amber-600 bg-amber-50', purple: 'text-purple-600 bg-purple-50', yellow: 'text-yellow-600 bg-yellow-50' };
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${map[color]}`}>
        <svg viewBox="0 0 24 24" className={`h-6 w-6 ${map[color].split(' ')[0]}`} fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
      </div>
      <div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xs text-emerald-600 mt-1">2 more than last quarter</div>
      </div>
    </Card>
  );
}
