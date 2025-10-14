'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import { useEffect, useMemo, useState } from 'react';
import { api, API_ORIGIN } from '../../utils/api';


type Notif = {
  id: string;
  message: string;
  actorName?: string;
  actorPhotoUrl?: string;
  read?: boolean;
  createdAt?: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const r = await api<{ items: Notif[]; unreadCount: number }>(`/notifications`);
      setItems(r.items || []);
      setUnreadCount(r.unreadCount || 0);
      setSelectedIds([]);
    } catch (e:any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, Notif[]> = {};
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(todayStart.getDate()-1);
    for (const n of items) {
      const d = n.createdAt ? new Date(n.createdAt) : new Date();
      let key = d < yesterdayStart ? d.toLocaleDateString() : (d >= todayStart ? 'Today' : 'Yesterday');
      groups[key] = groups[key] || []; groups[key].push(n);
    }
    const order = (k: string) => (k==='Today'?0: k==='Yesterday'?1:2);
    return Object.keys(groups).sort((a,b)=>order(a)-order(b)).map(k => ({ label: k, list: groups[k] }));
  }, [items]);

  async function markAllRead() {
    await api('/notifications/mark-all-read', { method: 'POST', body: JSON.stringify({}) });
    await load();
  }

  function toggleSelectAll(label: string, checked: boolean) {
    const ids = grouped.find(g=>g.label===label)?.list.map(x=>x.id) || [];
    setSelectedIds((prev) => {
      const set = new Set(prev);
      for (const id of ids) { if (checked) set.add(id); else set.delete(id); }
      return Array.from(set);
    });
  }

  function isSelected(id: string) { return selectedIds.includes(id); }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Notifications" subtitle="Read and delete notifications." />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Notifications ({unreadCount} unread)</h3>
            <button onClick={markAllRead} className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Mark All As Read</button>
          </Card>

          <Card className="p-0">
            <div className="p-5 pt-3 overflow-y-auto">
              {loading ? (
                <div className="text-sm text-gray-500 px-1 py-10">Loading…</div>
              ) : error ? (
                <div className="text-sm text-rose-600 px-1 py-10">{error}</div>
              ) : items.length === 0 ? (
                <div className="text-sm text-gray-500 px-1 py-10">No notifications</div>
              ) : (
                <div className="space-y-6">
                  {grouped.map(({ label, list }) => (
                    <div key={label} className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 px-1">
                        <div className="font-medium text-gray-500">{label}</div>
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" onChange={(e)=>toggleSelectAll(label, e.target.checked)} />
                          <span>Select all</span>
                        </label>
                      </div>
                      <div className="space-y-3">
                        {list.map((n) => (
                          <div key={n.id} className={(n.read? 'bg-white':'bg-blue-50/40')+ ' rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3'}>
                            <img src={n.actorPhotoUrl ? (n.actorPhotoUrl.startsWith('http')? n.actorPhotoUrl : `${API_ORIGIN}${n.actorPhotoUrl}`) : 'https://via.placeholder.com/40'} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-900 text-sm truncate">{n.message}</div>
                              <div className="text-xs text-gray-500">{timeAgo(n.createdAt)}</div>
                            </div>
                            {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                            <input type="checkbox" checked={isSelected(n.id)} onChange={(e)=>setSelectedIds((s)=> e.target.checked ? [...s, n.id] : s.filter(x=>x!==n.id))} />
                            <button className="ml-2 text-gray-500 hover:text-gray-700" title="More">⋯</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso); const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime())/1000);
  if (sec < 60) return `${sec}min ago`.replace(/^0/,'1');
  const min = Math.floor(sec/60); if (min < 60) return `${min}min ago`;
  const hr = Math.floor(min/60); if (hr < 24) return `${hr}hr ago`;
  const day = Math.floor(hr/24); return `${day} day${day>1?'s':''} ago`;
}
