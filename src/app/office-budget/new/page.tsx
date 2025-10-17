'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { budgetEntries, budgetKpis } from '../../../state/budget';

export default function CreateBudgetPage() {
  const router = useRouter();
  const [budgetNo, setBudgetNo] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [office, setOffice] = useState('');
  const [rows, setRows] = useState<
    Array<{ id: string; no: string; desc: string; amount: string; date: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // We support multiple drafts on this page; submit will send all of them.
  const [showSuccess, setShowSuccess] = useState(false);

  async function onCreateBudget() {
    setError(null);
    if (!budgetNo || !desc || !amount || !date) {
      setError('Please fill all required fields');
      return;
    }
    const amt = Number(String(amount).replace(/[^0-9.\-]/g, ''));
    if (!isFinite(amt) || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<{ id: string }>('/budget', {
        method: 'POST',
        body: JSON.stringify({
          budgetNo,
          description: desc,
          amountUsd: amt,
          date,
          receivingOffice: office || undefined,
        }),
      });
      // Keep as draft in this page and append to the request table
      const dd = new Date(date);
      const displayDate = `${String(dd.getDate()).padStart(2, '0')}/${String(dd.getMonth() + 1).padStart(2, '0')}/${dd.getFullYear()}`;
      setRows((prev) => [
        ...prev,
        { id: res.id, no: budgetNo, desc, amount: amt.toLocaleString('en-US'), date: displayDate },
      ]);
      // Clear inputs so multiple budgets can be created quickly
      setBudgetNo('');
      setDesc('');
      setAmount('');
      setDate('');
      setOffice('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitForApproval() {
    if (rows.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await Promise.all(rows.map((r) => api(`/budget/${r.id}/submit`, { method: 'POST' })));
      // Refresh caches so the list page shows updated KPIs/history
      budgetEntries.refresh().catch(() => void 0);
      budgetKpis.refresh().catch(() => void 0);
      setShowSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit budget');
    } finally {
      setSubmitting(false);
    }
  }

  const prettyAmount = useMemo(() => amount, [amount]);

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-[#F4F7FC] border-b border-gray-100">
          <DashboardHeader title="Create Budget" subtitle="Create and send budget request." />
          <div className="mt-4">
            <Link
              href="/office-budget"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* Create Budget form */}
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Create Budget</h3>
            <p className="text-sm text-gray-500 mt-1">
              Kindly fill in the form below to create a budget
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Budget number</Label>
                <Input
                  placeholder="Enter item"
                  value={budgetNo}
                  onChange={(e) => setBudgetNo(e.target.value)}
                />
              </div>
              <div className="md:col-span-1 md:col-start-2 md:col-end-4 md:order-none order-2 hidden" />
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Budget description</Label>
                <Input
                  placeholder="Enter description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Budget amount</Label>
                <Input
                  placeholder="Enter amount in $"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pr-10"
                  />
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 10h10v2H7zm0 4h10v2H7z" />
                  </svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Receiving office</Label>
                <div className="relative">
                  <select
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select option</option>
                    <option>Administration</option>
                    <option>Finance</option>
                    <option>HR</option>
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
            </div>

            <div className="mt-6">
              <button
                onClick={onCreateBudget}
                disabled={submitting}
                className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Budget'}
              </button>
              {error && <span className="ml-3 text-sm text-rose-600">{error}</span>}
            </div>
          </Card>

          {/* Budget Request preview */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-base font-semibold text-gray-900">Budget Request</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-5 py-3 font-medium">S/N</th>
                    <th className="px-5 py-3 font-medium">Budget No.</th>
                    <th className="px-5 py-3 font-medium">Budget Description</th>
                    <th className="px-5 py-3 font-medium">Budget Amount (USD)</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-sm text-gray-500" colSpan={5}>
                        No draft budgets yet. Create a budget above to add it here.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-4">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4">{r.no}</td>
                        <td className="px-5 py-4 text-gray-900">{r.desc}</td>
                        <td className="px-5 py-4">{r.amount}</td>
                        <td className="px-5 py-4">{r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={onSubmitForApproval}
                disabled={rows.length === 0 || submitting}
                className="mt-4 inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : `Submit for Approval (${rows.length})`}
              </button>
            </div>
          </Card>

          
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center">
          <div className="w-[320px] rounded-2xl bg-white p-6 text-center shadow-xl">
            <img
              src="/images/congratulations.png"
              alt="congratulations"
              className="mx-auto mb-3 h-16 w-16 object-contain"
            />
            <div className="text-lg font-semibold text-gray-900">Congratulations</div>
            <div className="mt-1 text-sm text-gray-600">
              Your budget has been submitted successfully.
            </div>
            <button
              onClick={() => {
                setShowSuccess(false);
                setRows([]);
                router.push('/office-budget');
              }}
              className="mt-5 inline-flex items-center justify-center h-10 w-full rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Success modal
// Placed at the end of component output via conditional rendering above
