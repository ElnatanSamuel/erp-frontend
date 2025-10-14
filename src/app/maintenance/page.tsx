'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';


type MaintItem = {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'Scheduled'|'Completed'|'Pending'|'Overdue'|string;
};

export default function MaintenancePage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth()); // 0-index
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString());

  const [kpis, setKpis] = useState<{ scheduled: number; completed: number; pending: number; overdue: number }|null>(null);
  const [items, setItems] = useState<MaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => { try { const r = await api('/maintenance/kpis'); setKpis(r as any); } catch {} })(); }, []);

  useEffect(() => {
    let alive = true; setLoading(true); setError(null);
    (async () => {
      try {
        const r = await api<{ items: MaintItem[] }>(`/maintenance?month=${month}&year=${year}`);
        if (!alive) return; setItems(r.items || []);
      } catch (e:any) { if (!alive) return; setError(e?.message || 'Failed to load'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [month, year]);

  const days = useMemo(() => buildMonth(year, month), [year, month]);
  const itemsByDate = useMemo(() => groupByDate(items), [items]);
  const statusByDate = useMemo(() => summarizeStatuses(items), [items]);
  const selectedKey = dayKey(new Date(selectedDate));
  const selectedList = itemsByDate[selectedKey] || [];
  const realToday = new Date();
  const todayKey = realToday.getFullYear() === year && realToday.getMonth() === month ? dayKey(realToday) : '';

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Maintenance" subtitle="View and create schedule for maintenance." />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <KpiCard color="blue" value={kpis? kpis.scheduled : '—'} label="Scheduled maintenance" sub="2 more than last quarter" iconPath="M3 3h18v6H3zM3 11h18v10H3z"/>
            <KpiCard color="green" value={kpis? kpis.completed : '—'} label="Completed maintenance" sub="2 more than last quarter" iconPath="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4z"/>
            <KpiCard color="amber" value={kpis? kpis.pending : '—'} label="Pending maintenance" sub="2 more than last quarter" iconPath="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
            <KpiCard color="rose" value={kpis? kpis.overdue : '—'} label="Overdue maintenance" sub="2 more than last quarter" iconPath="M12 2L3 7v10l9 5 9-5V7z"/>
          </div>

          {/* Schedule CTA */}
          <Card className="p-6 lg:p-7 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Schedule a Maintenance</h3>
            <Link href="/maintenance/create" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Schedule Maintenance</Link>
          </Card>

          {/* Calendar and list */}
          <Card className="p-6 lg:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={()=>prevMonth({month,year,setMonth,setYear})} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100">‹</button>
                  <div className="text-gray-900 font-medium">{monthLabel}</div>
                  <button onClick={()=>nextMonth({month,year,setMonth,setYear})} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100">›</button>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4 bg-[#EEF5FF] shadow-sm">
                  <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                    {['S','M','T','W','T','F','S'].map((d)=> <div key={d} className="py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {days.map((d, i) => {
                      const key = dayKey(d.date);
                      const isCur = d.inMonth;
                      const isToday = key === todayKey && isCur;
                      const has = (itemsByDate[key]?.length || 0) > 0;
                      return (
                        <button
                          key={i}
                          onClick={()=>setSelectedDate(d.date.toISOString())}
                          className={'relative h-10 w-10 mx-auto grid place-items-center rounded-full text-sm transition ' +
                            (isToday
                              ? 'text-white shadow-sm bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9]'
                              : has
                                ? 'text-blue-700 bg-transparent border border-[#3B82F6]'
                                : (!isCur ? 'text-gray-300' : 'text-gray-700 hover:bg-white/60'))}
                        >
                          <span>{d.date.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Scheduled list */}
              <div className="border-l border-gray-100 pl-6">
                <div className="text-sm text-gray-500">{fmtDate(new Date(selectedDate))}</div>
                <div className="mt-3 space-y-5">
                  {loading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                  ) : selectedList.length === 0 ? (
                    <div className="text-sm text-gray-500">No schedules for selected date</div>
                  ) : (
                    selectedList.map((it, idx) => (
                      <div key={it.id} className="space-y-2">
                        <div className="text-sm text-gray-700"><span className="font-semibold mr-1">{idx+1}.</span> {it.title}</div>
                        <Link href={`/maintenance/${it.id}`} className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm w-fit">View</Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>

          <footer className="text-center text-xs text-gray-400 pt-2 pb-6">Copyright © 2025 Relia Energy. All Rights Reserved</footer>
        </div>
      </div>
    </div>
  );
}

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const grid: { date: Date; inMonth: boolean }[] = [];
  for (let i = startDay - 1; i >= 0; i--) grid.push({ date: new Date(year, month - 1, prevDays - i), inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) grid.push({ date: new Date(year, month, d), inMonth: true });
  while (grid.length % 7 !== 0) grid.push({ date: new Date(year, month + 1, grid.length % 7), inMonth: false });
  return grid;
}
function dayKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function groupByDate(items: MaintItem[]) {
  const map: Record<string, MaintItem[]> = {};
  for (const it of items) {
    const d = new Date(it.date);
    const key = dayKey(d);
    (map[key] = map[key] || []).push(it);
  }
  return map;
}
function summarizeStatuses(items: MaintItem[]) {
  type Norm = 'completed'|'pending'|'overdue'|'scheduled';
  const mp: Record<string, Norm | undefined> = {};
  const priority = { overdue: 3, pending: 2, completed: 1, scheduled: 0 } as const;
  for (const it of items) {
    const k = dayKey(new Date(it.date));
    const s = (it.status || '').toLowerCase();
    let norm: keyof typeof priority = 'scheduled';
    if (s.includes('overdue')) norm = 'overdue';
    else if (s.includes('pending')) norm = 'pending';
    else if (s.includes('completed')) norm = 'completed';
    const cur = mp[k] as keyof typeof priority | undefined;
    if (cur === undefined || priority[norm] > priority[cur]) mp[k] = norm as Norm;
  }
  return mp;
}
function prevMonth({ month, year, setMonth, setYear }: { month: number; year: number; setMonth: (n:number)=>void; setYear: (n:number)=>void }) {
  if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); }
}
function nextMonth({ month, year, setMonth, setYear }: { month: number; year: number; setMonth: (n:number)=>void; setYear: (n:number)=>void }) {
  if (month === 11) { setMonth(0); setYear(year + 1); } else { setMonth(month + 1); }
}
function fmtDate(d: Date) {
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = d.toLocaleDateString(undefined, { month: 'long' });
  const yyyy = d.getFullYear();
  return `${dd} ${mm}, ${yyyy}`;
}

function KpiCard({ color, value, label, sub, iconPath }: { color: 'blue'|'green'|'purple'|'rose'|'amber'; value: any; label: string; sub: string; iconPath: string }) {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
  };
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${colorMap[color]}`}><svg viewBox="0 0 24 24" className={`h-6 w-6 ${colorMap[color].split(' ')[0]}`} fill="currentColor"><path d={iconPath}/></svg></div>
      <div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xs text-emerald-600 mt-1">{sub}</div>
      </div>
    </Card>
  );
}
