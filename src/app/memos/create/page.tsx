'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useReducer, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api, apiMultipart } from '../../../utils/api';
import { authClient } from '../../../utils/authClient';

type FormState = {
  title: string;
  sentFrom: string;
  sentTo: string;
  date: string;
  hasAttachment: boolean;
  action: string;
  attachmentType: string;
  body: string;
  cc?: string[];
  attachmentName?: string;
  attachmentUrl?: string;
};

function formReducer(state: FormState, update: Partial<FormState>): FormState {
  return { ...state, ...update };
}

export default function CreateMemoPage() {
  const { data: session } = authClient.useSession();
  const [sentToOptions, setSentToOptions] = useState<string[]>([]);
  const [form, setForm] = useReducer(formReducer, {
    title: '',
    sentFrom: '',
    sentTo: '',
    date: '',
    hasAttachment: false,
    action: '',
    attachmentType: '',
    body: '',
    cc: [],
    attachmentName: '',
    attachmentUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [nextHref, setNextHref] = useState<string | null>(null);
  const actionOptions = ['Approval', 'For Information', 'Urgent'];
  const attachTypeOptions = ['Payment Voucher', 'Document', 'Image', 'Other'];

  useEffect(() => {
    const name = (session?.user as any)?.name || '';
    if (name) { setForm({ sentFrom: name }); }
  }, [session]);

  useEffect(() => {
    if (modalOpen && nextHref) {
      const t = setTimeout(() => { window.location.href = nextHref; }, 1200);
      return () => clearTimeout(t);
    }
  }, [modalOpen, nextHref]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ items: any[] }>('/users');
        const names = new Set<string>();
        for (const u of res.items || []) {
          const name = u.name || `${u.firstName||''} ${u.lastName||''}`.trim();
          if (name) names.add(name);
        }
        setSentToOptions(Array.from(names));
      } catch {}
    })();
  }, []);

  async function onCreate() {
    setError(null);
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.sentTo.trim()) { setError('Please select recipient'); return; }
    setSubmitting(true);
    try {
      const res = await api<{ id: string }>('/memos', { method: 'POST', body: JSON.stringify({
        title: form.title,
        sentFrom: form.sentFrom,
        sentTo: form.sentTo,
        date: form.date,
        hasAttachment: form.hasAttachment,
        type: 'Sent',
        action: form.action,
        attachmentType: form.attachmentType,
        body: form.body,
        cc: form.cc,
        attachmentName: form.attachmentName,
        attachmentUrl: form.attachmentUrl,
      }) });
      setNextHref('/memos');
      setModalOpen(true);
    } catch (e:any) {
      setError(e?.message || 'Failed to create memo');
    } finally { setSubmitting(false); }
  }

  function onAttachVoucher() {
    // open hidden file input
    const input = document.getElementById('memo_file_input') as HTMLInputElement | null;
    if (input) input.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('file', f);
    try {
      const up = await apiMultipart<{ name: string; url: string }>('/memos/upload', fd);
      setForm({ hasAttachment: true, attachmentType: form.attachmentType || 'Payment Voucher', attachmentName: up.name, attachmentUrl: up.url });
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Memo" subtitle="Create memo" />
          <div className="mt-4">
            <Link href="/memos" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Create Memo</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Memo title</label>
                <Input placeholder="Enter title" value={form.title} onChange={(e) => setForm({ title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Sent from</label>
                <Input value={form.sentFrom} onChange={(e) => setForm({ sentFrom: e.target.value })} readOnly disabled className="bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Sent to</label>
                <div className="relative">
                  <select value={form.sentTo} onChange={(e) => setForm({ sentTo: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select option</option>
                    {sentToOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Action</label>
                <div className="relative">
                  <select value={form.action} onChange={(e)=>setForm({ action: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select option</option>
                    {actionOptions.map((opt)=> (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">CC 1</label>
                <Input placeholder="Optional" value={form.cc?.[0] || ''} onChange={(e) => {
                  const arr = [...(form.cc || [])]; arr[0] = e.target.value; setForm({ cc: arr });
                }} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">CC 2</label>
                <Input placeholder="Optional" value={form.cc?.[1] || ''} onChange={(e) => {
                  const arr = [...(form.cc || [])]; arr[1] = e.target.value; setForm({ cc: arr });
                }} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">CC 3</label>
                <Input placeholder="Optional" value={form.cc?.[2] || ''} onChange={(e) => {
                  const arr = [...(form.cc || [])]; arr[2] = e.target.value; setForm({ cc: arr });
                }} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Add attachment?</label>
                <div className="relative">
                  <select value={form.hasAttachment ? 'Yes' : 'No'} onChange={(e)=>setForm({ hasAttachment: e.target.value === 'Yes' })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Attachment type</label>
                <div className="relative">
                  <select value={form.attachmentType} onChange={(e)=>setForm({ attachmentType: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                    <option value="">Select type</option>
                    {attachTypeOptions.map((opt)=> (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm text-gray-600 mb-2">Memo body</label>
                <textarea placeholder="Enter subject" value={form.body} onChange={(e)=>setForm({ body: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 min-h-[120px]" />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <input id="memo_file_input" type="file" onChange={onFileSelected} className="hidden" />
              <button type="button" onClick={onAttachVoucher} className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Attach Payment Voucher</button>
              {form.attachmentName && <span className="text-sm text-gray-600">Attached: {form.attachmentName}</span>}
              <button onClick={onCreate} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">{submitting ? 'Sending…' : 'Send Memo'}</button>
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
            <div className="text-sm text-gray-600 mb-5">Your memo has been created and sent successfully.</div>
            <button onClick={() => { setModalOpen(false); if (nextHref) window.location.href = nextHref; }} className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Ok</button>
          </div>
        </div>
      )}
    </div>
  );
}
