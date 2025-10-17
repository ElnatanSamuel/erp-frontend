'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useReducer, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api } from '../../../utils/api';


type Form = {
  description: string;
  trainingType: string;
  duration: string;
  date: string;
  mode: string;
  staff: string[];
};

function reducer(state: Form, patch: Partial<Form>): Form { return { ...state, ...patch }; }

export default function TrainingRequestPage() {
  const [form, setForm] = useReducer(reducer, { description: '', trainingType: '', duration: '', date: '', mode: '', staff: [] });
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ items: any[] }>(`/users`);
        const names = new Set<string>();
        for (const u of res.items || []) {
          const name = u.name || `${u.firstName||''} ${u.lastName||''}`.trim();
          if (name) names.add(name);
        }
        setStaffOptions(Array.from(names));
      } catch {}
    })();
  }, []);

  async function onSubmit(status: 'To-do' | 'Inprogress' | 'Completed') {
    setError(null);
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.date) { setError('Training date is required'); return; }
    setSubmitting(true);
    try {
      await api('/trainings', { method: 'POST', body: JSON.stringify({
        description: form.description,
        trainingType: form.trainingType,
        duration: form.duration,
        date: form.date,
        mode: form.mode,
        staff: form.staff,
        status,
      })});
      setModalOpen(true);
      setTimeout(() => { window.location.href = '/capacity-building'; }, 1200);
    } catch (e:any) {
      setError(e?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  }

  function toggleStaff(name: string, checked: boolean) {
    if (checked) setForm({ staff: Array.from(new Set([...(form.staff||[]), name])) });
    else setForm({ staff: (form.staff||[]).filter((n) => n !== name) });
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
            <h3 className="text-base font-semibold text-gray-900">Training Request</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Training description</label>
                <Input placeholder="Enter description" value={form.description} onChange={(e)=>setForm({ description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Training type</label>
                <div className="relative">
                  <select value={form.trainingType} onChange={(e)=>setForm({ trainingType: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select type</option>
                    {['Team','Individual'].map((x)=> <option key={x} value={x}>{x}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Training duration</label>
                <div className="relative">
                  <select value={form.duration} onChange={(e)=>setForm({ duration: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select option</option>
                    {['3days','1week','2weeks','1month'].map((x)=> <option key={x} value={x}>{x}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Training date</label>
                <Input type="date" value={form.date} onChange={(e)=>setForm({ date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Training mode</label>
                <div className="relative">
                  <select value={form.mode} onChange={(e)=>setForm({ mode: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select mode</option>
                    {['Physical','Online','Hybrid'].map((x)=> <option key={x} value={x}>{x}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Staff to be trained</label>
                <div className="rounded-xl border border-gray-200 bg-white p-3 max-h-44 overflow-y-auto">
                  {staffOptions.length === 0 ? (
                    <div className="text-sm text-gray-500">Loading staff…</div>
                  ) : (
                    staffOptions.map((name) => (
                      <label key={name} className="flex items-center gap-3 py-1 text-sm text-gray-700">
                        <input type="checkbox" checked={form.staff.includes(name)} onChange={(e)=>toggleStaff(name, e.target.checked)} />
                        <span>{name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button onClick={()=>onSubmit('Inprogress')} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{submitting ? 'Submitting…' : 'Save and Submit'}</button>
              <button onClick={()=>onSubmit('To-do')} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">Save</button>
              {error && <span className="text-sm text-rose-600">{error}</span>}
            </div>
          </Card>

          
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-[320px] p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 grid place-items-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Congratulations</div>
            <div className="text-sm text-gray-600 mb-5">Training request submitted successfully.</div>
            <button onClick={() => { setModalOpen(false); window.location.href = '/capacity-building'; }} className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Ok</button>
          </div>
        </div>
      )}
    </div>
  );
}
