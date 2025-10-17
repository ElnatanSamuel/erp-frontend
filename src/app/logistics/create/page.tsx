'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api } from '../../../utils/api';
import { authClient } from '../../../utils/authClient';

export default function CreateLogisticsPage() {

  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [sentToOptions, setSentToOptions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [voucherName, setVoucherName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [verifierSignature, setVerifierSignature] = useState('');
  const [authorizerSignature, setAuthorizerSignature] = useState('');
  const [pv, setPv] = useState<{
    title: string;
    purpose: string;
    dateFrom: string;
    dateTo: string;
    amount: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [nextHref, setNextHref] = useState<string | null>(null);

  const fmtAmt = (s?: string) => {
    const n = Number(
      String(s ?? '')
        .replace(/,/g, '')
        .trim()
    );
    return Number.isFinite(n)
      ? n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';
  };

  useEffect(() => {
    authClient.getMe().then(({ data }) => {
      const name = data?.user?.name || '';
      if (name) setRequestedBy(name);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ items: any[] }>('/users');
        const names = new Set<string>();
        for (const u of res.items || []) {
          const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
          if (name) names.add(name);
        }
        setSentToOptions(Array.from(names));
      } catch {}
    })();
  }, []);

  function onAttachClick() {
    // Push current form data into Payment Voucher preview
    setPv({ title, purpose, dateFrom, dateTo, amount });
    // Do not mark attachment; this button only snapshots the form.
  }

  async function onCreate(status: 'Draft' | 'Pending') {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!purpose.trim()) {
      setError('Purpose is required');
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) {
      setError('Enter a valid non-negative amount');
      return;
    }
    if (!sentTo.trim()) {
      setError('Please select who to send to');
      return;
    }
    if (!dateFrom || !dateTo) {
      setError('Please select date range');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<{ id: string }>(
        '/logistics',
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            purpose,
            amount: amt,
            requestedBy,
            sentTo,
            dateFrom,
            dateTo,
            voucherName, // remains empty => Attachment: No
            accountName,
            accountNumber,
            bankName,
            verifierSignature,
            authorizerSignature,
            status,
          }),
        }
      );
      const href = status === 'Pending' && res?.id ? `/logistics/${res.id}` : '/logistics';
      setNextHref(href);
      setModalText(status === 'Pending' ? 'Your logistics request has been submitted successfully.' : 'Your logistics request has been saved as a draft.');
      setModalOpen(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Logistics" subtitle="Make and send logistics request." />
          <div className="mt-4">
            <Link
              href="/logistics"
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
            <h3 className="text-base font-semibold text-gray-900">Logistics Request</h3>
            <p className="text-sm text-gray-500 mt-1">
              Kindly fill in the form below to submit a logistics request
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Title</label>
                <Input
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Purpose</label>
                <Input
                  placeholder="Enter purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Amount</label>
                <Input
                  placeholder="Enter amount in ₦"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Requested by</label>
                <Input
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Sent to</label>
                <div className="relative">
                  <select
                    value={sentTo}
                    onChange={(e) => setSentTo(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select option</option>
                    {sentToOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
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
                <label className="block text-sm text-gray-600 mb-2">Date from</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
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
                <label className="block text-sm text-gray-600 mb-2">Date to</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
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

              <div className="md:col-span-3">
                <div>
                  <button
                    type="button"
                    onClick={onAttachClick}
                    className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
                  >
                    Attach Payment Voucher
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Voucher Preview */}
            <div className="mt-8">
              <h4 className="text-base font-semibold text-gray-900">Payment Voucher</h4>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-y bg-gray-50">
                      <th className="px-5 py-3 font-medium">S/N</th>
                      <th className="px-5 py-3 font-medium">Request Title</th>
                      <th className="px-5 py-3 font-medium">Purpose</th>
                      <th className="px-5 py-3 font-medium">Date From</th>
                      <th className="px-5 py-3 font-medium">Date To</th>
                      <th className="px-5 py-3 font-medium">Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b last:border-0">
                      <td className="px-5 py-4">01</td>
                      <td className="px-5 py-4 text-gray-900">{pv?.title || '—'}</td>
                      <td className="px-5 py-4">{pv?.purpose || '—'}</td>
                      <td className="px-5 py-4">{pv?.dateFrom || '—'}</td>
                      <td className="px-5 py-4">{pv?.dateTo || '—'}</td>
                      <td className="px-5 py-4">{fmtAmt(pv?.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Beneficiary Payment Details */}
            <div className="mt-8">
              <h4 className="text-base font-semibold text-gray-900">Beneficiary Payment Details</h4>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Account name</label>
                  <Input
                    placeholder="Enter name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Account number</label>
                  <Input
                    placeholder="Enter number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Bank name</label>
                  <Input
                    placeholder="Enter bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Verifier Signature</label>
                  <input
                    value={verifierSignature}
                    onChange={(e) => setVerifierSignature(e.target.value)}
                    placeholder=""
                    className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 h-10"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Authorizer Signature</label>
                  <input
                    value={authorizerSignature}
                    onChange={(e) => setAuthorizerSignature(e.target.value)}
                    placeholder=""
                    className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 h-10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => onCreate('Pending')}
                disabled={submitting}
                className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Save and Send for Approval'}
              </button>
              <button
                onClick={() => onCreate('Draft')}
                disabled={submitting}
                className="inline-flex items-center justify-center h-11 px-8 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save
              </button>
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
            <div className="text-sm text-gray-600 mb-5">{modalText}</div>
            <button onClick={() => { setModalOpen(false); if (nextHref) window.location.href = nextHref; }} className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Ok</button>
          </div>
        </div>
      )}
    </div>
  );
}
