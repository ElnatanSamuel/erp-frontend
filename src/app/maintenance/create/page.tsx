'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useReducer, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api } from '../../../utils/api';

type Form = {
  itemName: string;
  itemNumber: string;
  maintenanceType: string;
  recurringOption: string;
  date: string;
};

function reducer(state: Form, patch: Partial<Form>): Form { return { ...state, ...patch }; }

export default function CreateMaintenancePage() {
  const [form, setForm] = useReducer(reducer, { itemName: '', itemNumber: '', maintenanceType: '', recurringOption: '', date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function onCreate() {
    setError(null);
    if (!form.itemName) { setError('Item is required'); return; }
    if (!form.date) { setError('Date is required'); return; }
    setSubmitting(true);
    try {
      await api('/maintenance', { method: 'POST', body: JSON.stringify({
        // let backend auto-generate title from these fields
        title: '',
        date: form.date,
        description: '',
        status: 'Scheduled',
        itemName: form.itemName,
        itemNumber: form.itemNumber,
        maintenanceType: form.maintenanceType,
        recurringOption: form.recurringOption,
      }) });
      setModalOpen(true);
      setTimeout(() => { window.location.href = '/maintenance'; }, 1200);
    } catch (e:any) {
      setError(e?.message || 'Failed to schedule maintenance');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Schedule Maintenance" subtitle="Schedule a maintenance for future use." />
          <div className="mt-4">
            <Link href="/maintenance" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Schedule Maintenance</h3>
            <p className="text-sm text-gray-500 mt-1">Kindly fill in the form below to schedule a maintenance.</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Item name */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Item name</label>
                <div className="relative">
                  <select value={form.itemName} onChange={(e)=>setForm({ itemName: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select item</option>
                    {['AC Unit','Generator','Company Vehicle','Elevator','Server Rack'].map((x)=> <option key={x} value={x}>{x}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              {/* Number */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Number</label>
                <div className="relative">
                  <select value={form.itemNumber} onChange={(e)=>setForm({ itemNumber: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select option</option>
                    {['1 unit','2 units','3 units','4 units','5 units'].map((x)=> <option key={x} value={x}>{x}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date</label>
                <div className="relative">
                  <Input type="date" value={form.date} onChange={(e) => setForm({ date: e.target.value })} />
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              {/* Maintenance type */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Maintenance type</label>
                <div className="relative">
                  <select value={form.maintenanceType} onChange={(e)=>setForm({ maintenanceType: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select option</option>
                    {['Service','Inspection','Repair','Replacement'].map((x)=> <option key={x} value={x}>{x}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              {/* Recurring option */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Recurring option</label>
                <div className="relative">
                  <select value={form.recurringOption} onChange={(e)=>setForm({ recurringOption: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select option</option>
                    {['None','Weekly','Monthly','Quarterly','Yearly'].map((x)=> <option key={x} value={x}>{x}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button onClick={onCreate} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{submitting ? 'Scheduling…' : 'Schedule Maintenance'}</button>
              {error && <span className="ml-4 text-sm text-rose-600">{error}</span>}
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
            <div className="text-sm text-gray-600 mb-5">Maintenance schedule created successfully.</div>
            <button onClick={() => { setModalOpen(false); window.location.href = '/maintenance'; }} className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Ok</button>
          </div>
        </div>
      )}
    </div>
  );
}
