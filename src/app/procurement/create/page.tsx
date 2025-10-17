'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api } from '../../../utils/api';
import { authClient } from '../../../utils/authClient';

export default function CreateProcurementPage() {
  const [userName, setUserName] = useState('');

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [sentToOptions, setSentToOptions] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [addAttachment, setAddAttachment] = useState('');
  const [attachmentType, setAttachmentType] = useState('');
  const [pv, setPv] = useState<any>(null);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [verifierSignature, setVerifierSignature] = useState('');
  const [authorizerSignature, setAuthorizerSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [nextHref, setNextHref] = useState<string | null>(null);

  const fmtAmt = (s?: string) => {
    const n = Number(String(s ?? '').replace(/,/g, '').trim());
    return Number.isFinite(n)
      ? n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';
  };

  useEffect(() => {
    authClient.getMe().then(({ data }) => {
      const name = data?.user?.name || '';
      if (name) {
        setUserName(name);
        setRequestedBy(name);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const total = qty * price;
    setTotalPrice(String(total));
  }, [quantity, unitPrice]);

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
    setPv({
      itemName,
      quantity,
      date,
      unitPrice,
      totalPrice,
      vatPercent: 7.5,
      vatAmount: (Number(totalPrice) * 0.075).toFixed(2),
      grossAmount: (Number(totalPrice) * 1.075).toFixed(2),
    });
  }

  async function onCreate(status: 'Draft' | 'Pending') {
    setError(null);
    if (!itemName.trim()) {
      setError('Item name is required');
      return;
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      setError('Enter a valid quantity (at least 1)');
      return;
    }
    const price = Number(unitPrice);
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid unit price');
      return;
    }
    if (!sentTo.trim()) {
      setError('Please select who to send to');
      return;
    }
    setSubmitting(true);
    try {
      const vatPercent = 7.5;
      const vatAmount = Number(totalPrice) * (vatPercent / 100);
      const grossAmount = Number(totalPrice) + vatAmount;

      const res = await api<{ id: string }>('/procurement', {
        method: 'POST',
        body: JSON.stringify({
          itemName,
          quantity: qty,
          unitPrice: price,
          totalPrice: Number(totalPrice),
          requestedBy,
          sentTo,
          date: date || new Date().toISOString(),
          addAttachment,
          attachmentType,
          hasAttachment: pv ? 'Yes' : 'No',
          vatPercent,
          vatAmount,
          grossAmount,
          accountName,
          accountNumber,
          bankName,
          initiatedBy: requestedBy,
          verifiedBy,
          approvedBy,
          verifierSignature,
          authorizerSignature,
          status,
        }),
      });
      const href = status === 'Pending' && res?.id ? `/procurement/${res.id}` : '/procurement';
      setNextHref(href);
      setModalText(
        status === 'Pending'
          ? 'Your procurement request has been submitted successfully.'
          : 'Your procurement request has been saved as a draft.'
      );
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
          <DashboardHeader title="Procurement" subtitle="Make and send procurement request." />
          <div className="mt-4">
            <Link
              href="/procurement"
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
            <h3 className="text-base font-semibold text-gray-900">Procurement Request</h3>
            <p className="text-sm text-gray-500 mt-1">
              Kindly fill in the form below to submit a procurement request
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Item</label>
                <Input
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Quantity</label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Unit price</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Total price</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Requested by</label>
                <Input
                  value={requestedBy}
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
                <label className="block text-sm text-gray-600 mb-2">Add Attachment</label>
                <div className="relative">
                  <select
                    value={addAttachment}
                    onChange={(e) => setAddAttachment(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
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
                <label className="block text-sm text-gray-600 mb-2">Attachment type</label>
                <div className="relative">
                  <select
                    value={attachmentType}
                    onChange={(e) => setAttachmentType(e.target.value)}
                    className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Select option</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Receipt">Receipt</option>
                    <option value="Quotation">Quotation</option>
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

              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={onAttachClick}
                  className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
                >
                  Attach Payment Voucher
                </button>
              </div>
            </div>

            {/* Payment Voucher */}
            {pv && (
              <div className="mt-8">
                <h4 className="text-base font-semibold text-gray-900">Payment Voucher</h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-y bg-gray-50">
                        <th className="px-5 py-3 font-medium">S/N</th>
                        <th className="px-5 py-3 font-medium">Item</th>
                        <th className="px-5 py-3 font-medium">Quantity</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Unit Price (₦)</th>
                        <th className="px-5 py-3 font-medium">Total Price (₦)</th>
                        <th className="px-5 py-3 font-medium">VAT %</th>
                        <th className="px-5 py-3 font-medium">VAT Amount (₦)</th>
                        <th className="px-5 py-3 font-medium">Gross Amount (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-5 py-4">01</td>
                        <td className="px-5 py-4 text-gray-900">{pv.itemName || '—'}</td>
                        <td className="px-5 py-4">{pv.quantity || '—'}</td>
                        <td className="px-5 py-4">{pv.date || '—'}</td>
                        <td className="px-5 py-4">{fmtAmt(pv.unitPrice)}</td>
                        <td className="px-5 py-4">{fmtAmt(pv.totalPrice)}</td>
                        <td className="px-5 py-4">{pv.vatPercent}%</td>
                        <td className="px-5 py-4">{fmtAmt(pv.vatAmount)}</td>
                        <td className="px-5 py-4">{fmtAmt(pv.grossAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
            </div>

            {/* Memo Activities */}
            <div className="mt-8">
              <h4 className="text-base font-semibold text-gray-900">Memo Activities</h4>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Initiated by</label>
                  <Input
                    value={requestedBy}
                    readOnly
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Verified by</label>
                  <div className="relative">
                    <select
                      value={verifiedBy}
                      onChange={(e) => setVerifiedBy(e.target.value)}
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
                  <label className="block text-sm text-gray-600 mb-2">Approved by</label>
                  <div className="relative">
                    <select
                      value={approvedBy}
                      onChange={(e) => setApprovedBy(e.target.value)}
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
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Congratulations</div>
            <div className="text-sm text-gray-600 mb-5">{modalText}</div>
            <button
              onClick={() => {
                setModalOpen(false);
                if (nextHref) window.location.href = nextHref;
              }}
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
