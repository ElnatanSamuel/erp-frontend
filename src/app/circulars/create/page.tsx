'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api } from '../../../utils/api';
import { authClient } from '../../../utils/authClient';

export default function CreateCircularPage() {

  const [title, setTitle] = useState('');
  const [sentFrom, setSentFrom] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [sentToOptions, setSentToOptions] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authClient.getMe().then(({ data }) => {
      const name = data?.user?.name || '';
      if (name) setSentFrom(name);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ items: any[] }>('/users');
        const set = new Set<string>();
        set.add('All Staff');
        for (const u of res.items || []) {
          if (u.designation) set.add(u.designation);
        }
        setSentToOptions(Array.from(set));
      } catch {}
    })();
  }, []);

  async function onCreate() {
    setError(null);
    if (!title.trim()) { setError('Title is required'); return; }
    if (!sentTo.trim()) { setError('Please select who to send to'); return; }
    setSubmitting(true);
    try {
      await api('/circulars', { method: 'POST', body: JSON.stringify({ title, sentFrom, sentTo, date, type: 'Sent', body }) });
      window.location.href = '/circulars';
    } catch (e: any) {
      setError(e?.message || 'Failed to send circular');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Create Circulars" subtitle="Create and send circulars to designated offices." />
          <div className="mt-4">
            <Link href="/circulars" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Create Circular</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Circular title</label>
                <Input placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Sent from</label>
                <Input value={sentFrom} onChange={(e) => setSentFrom(e.target.value)} readOnly disabled className="bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Sent to</label>
                <div className="relative">
                  <select value={sentTo} onChange={(e) => setSentTo(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select option</option>
                    {sentToOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Date</label>
                <div className="relative">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled className="bg-gray-100 pr-10" />
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10h10v2H7zm0 4h10v2H7z"/></svg>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Circular message</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y" placeholder="Enter message..." />
              </div>
            </div>

            <div className="mt-6">
              <button onClick={onCreate} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{submitting ? 'Sending…' : 'Send Circular'}</button>
              {error && <span className="ml-3 text-sm text-rose-600">{error}</span>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
