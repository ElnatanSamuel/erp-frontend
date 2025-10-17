'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../utils/api';

type Application = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  position?: string;
  qualification?: string;
  experience?: string;
  coverLetter?: string;
  resumeUrl?: string;
  status?: string;
  appliedDate?: string;
};

export default function ApplicationDetailsPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [data, setData] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api<Application>(`/staff-applications/${id}`);
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Failed to load application');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  async function onSubmitAction() {
    if (!action) {
      setError('Please select an action');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api(`/staff-applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: action }),
      });
      setModalOpen(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit action');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Staff Applications" subtitle="Application details" />
          <div className="mt-4">
            <Link
              href="/staff-applications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-lg font-semibold text-gray-900">
              {data?.fullName || (loading ? 'Loading…' : '—')}
            </h3>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 text-[15px]">
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Email:</span>
                <span className="text-gray-900">{data?.email || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Phone:</span>
                <span className="text-gray-900">{data?.phone || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Position:</span>
                <span className="text-gray-900">{data?.position || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Qualification:</span>
                <span className="text-gray-900">{data?.qualification || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Experience:</span>
                <span className="text-gray-900">{data?.experience || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Applied Date:</span>
                <span className="text-gray-900">{fmtDate(data?.appliedDate)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Status:</span>
                <span className="text-gray-900">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    data?.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    data?.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    data?.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {data?.status || '—'}
                  </span>
                </span>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <span className="text-gray-500 w-32">Address:</span>
                <span className="text-gray-900">{data?.address || '—'}</span>
              </div>
            </div>

            {data?.coverLetter && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Cover Letter</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.coverLetter}</p>
              </div>
            )}

            {data?.resumeUrl && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Resume</h4>
                {data.resumeUrl.match(/\.pdf$/i) ? (
                  <iframe src={data.resumeUrl} className="w-full h-[600px] border rounded-lg" />
                ) : (
                  <a
                    href={data.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download Resume
                  </a>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6 lg:p-7">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Update Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Action</label>
                <div className="relative">
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700"
                  >
                    <option value="">Select action</option>
                    <option value="Reviewed">Mark as Reviewed</option>
                    <option value="Accepted">Accept</option>
                    <option value="Rejected">Reject</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
              <div>
                <button
                  onClick={onSubmitAction}
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-[320px] p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 grid place-items-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Success</div>
            <div className="text-sm text-gray-600 mb-5">
              Application status has been updated successfully.
            </div>
            <button
              onClick={() => (window.location.href = '/staff-applications')}
              className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
