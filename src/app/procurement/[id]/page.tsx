'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../utils/api';
import { useParams } from 'next/navigation';

export default function ProcurementDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadItem();
  }, [id]);

  async function loadItem() {
    setLoading(true);
    try {
      const res = await api<any>(`/procurement/${id}`);
      setItem(res);
    } catch {
      setItem(null);
    } finally {
      setLoading(false);
    }
  }

  const fmtAmt = (n: number) =>
    Number.isFinite(n)
      ? n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';

  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  async function handleSubmit() {
    if (!action) {
      alert('Please select an action');
      return;
    }
    setUpdating(true);
    try {
      await api(`/procurement/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: action === 'Approve' ? 'Approved' : 'Rejected' }),
      });
      alert('Action submitted successfully');
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || 'Failed to submit action');
    } finally {
      setUpdating(false);
    }
  }

  const fmtDate = (d: any) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB');
    } catch {
      return '—';
    }
  };

  const statusColor = (s: string) => {
    if (s === 'Approved') return 'text-green-600 bg-green-50';
    if (s === 'Pending') return 'text-orange-600 bg-orange-50';
    if (s === 'Rejected') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Procurement request not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Procurement Details" subtitle="View procurement request details." />
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
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Procurement Request Detail</h3>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Items: </span>
                <span className="text-sm text-gray-900">{item.itemName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Quantity: </span>
                <span className="text-sm text-gray-900">{item.quantity}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Unit Price: </span>
                <span className="text-sm text-gray-900">₦{fmtAmt(item.unitPrice)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Total Price: </span>
                <span className="text-sm text-gray-900">₦{fmtAmt(item.totalPrice)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Date: </span>
                <span className="text-sm text-gray-900">{fmtDate(item.date)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Requested By: </span>
                <span className="text-sm text-gray-900">{item.requestedBy || '—'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Sent To: </span>
                <span className="text-sm text-gray-900">{item.sentTo || '—'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Request Status: </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Attachment: </span>
                <span className="text-sm text-gray-900">{item.hasAttachment || 'No'}</span>
              </div>
            </div>

            {item.hasAttachment === 'Yes' && item.vatPercent && (
              <div className="mt-8 pt-6 border-t">
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">Relia Energy</div>
                      <div className="text-xs text-gray-500 mt-1">20th October, 2022</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <div className="font-semibold">RC NO:</div>
                      <div className="font-semibold">TIN:</div>
                      <div className="font-semibold">CONTRACT:</div>
                    </div>
                    <div>
                      <div>1667968</div>
                      <div>22369458-0001</div>
                      <div>Contract for The Provision of Fuel Management and Distribution Services to NNPC RETAIL Filling stations.</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="font-semibold mb-2">Bill to:</div>
                    <div className="text-sm bg-gray-50 p-3 rounded">
                      <div>THE MANAGING DIRECTOR</div>
                      <div>NNPC RETAIL LIMITED</div>
                      <div>COKER ROAD</div>
                      <div>P.M.B 7342, BENIN CITY</div>
                      <div>EDO STATE</div>
                      <div>NIGERIA</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-semibold mb-2">INVOICE NUMBER: {item.id?.substring(0, 8)}</div>
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border px-3 py-2 text-left">S/N</th>
                          <th className="border px-3 py-2 text-left">ITEM</th>
                          <th className="border px-3 py-2 text-left">DESCRIPTION</th>
                          <th className="border px-3 py-2 text-right">QUANTITY</th>
                          <th className="border px-3 py-2 text-right">RATE</th>
                          <th className="border px-3 py-2 text-right">AMOUNT (NGN)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-3 py-2">1</td>
                          <td className="border px-3 py-2">{item.itemName}</td>
                          <td className="border px-3 py-2">—</td>
                          <td className="border px-3 py-2 text-right">{item.quantity}</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(item.unitPrice)}</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(item.totalPrice)}</td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="border px-3 py-2 text-right font-semibold">TOTAL</td>
                          <td className="border px-3 py-2 text-right font-semibold">₦{fmtAmt(item.totalPrice)}</td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="border px-3 py-2 text-right">@ {item.vatPercent}% VAT</td>
                          <td className="border px-3 py-2 text-right">₦{fmtAmt(item.vatAmount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="border px-3 py-2 text-right font-semibold">GRAND TOTAL</td>
                          <td className="border px-3 py-2 text-right font-semibold">₦{fmtAmt(item.grossAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-sm">
                    <div className="font-semibold">Amount In Words:</div>
                    <div className="italic">One Million Two hundred and ninety-four thousand two hundred and sixty-nine naira (₦ ninety kobo)</div>
                  </div>

                  {item.accountName && (
                    <div className="mt-4 text-sm bg-gray-50 p-3 rounded">
                      <div className="font-semibold mb-2">Account Details:</div>
                      <div><span className="font-medium">Account Name:</span> {item.accountName}</div>
                      <div><span className="font-medium">Account Number:</span> {item.accountNumber}</div>
                      <div><span className="font-medium">Bank:</span> {item.bankName}</div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-xs text-center text-gray-500">FOR: RELIA ENERGY LIMITED</div>
                    <div className="mt-8 grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="border-t border-gray-400 pt-2">
                          <div className="font-semibold">SIGNATURE</div>
                          <div className="text-xs">STAFF NAME</div>
                          <div className="text-xs">STAFF DESIGNATION</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-gray-400 pt-2">
                          <div className="font-semibold">SIGNATURE</div>
                          <div className="text-xs">STAFF NAME</div>
                          <div className="text-xs">STAFF DESIGNATION</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Action</label>
                  <div className="relative">
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select action</option>
                      <option value="Approve">Approve</option>
                      <option value="Reject">Reject</option>
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
                  <label className="block text-sm text-gray-600 mb-2">Remarks</label>
                  <input
                    type="text"
                    placeholder="Enter remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={updating}
                  className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
                >
                  {updating ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
