'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../utils/api';
import { useParams } from 'next/navigation';

export default function PaymentVoucherDetailPage() {
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
      const res = await api<any>(`/payment-voucher/${id}`);
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

  const fmtDate = (d: any) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB');
    } catch {
      return '—';
    }
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
          <div className="text-gray-500">Payment voucher not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Payment Voucher Details" subtitle="View payment voucher details." />
          <div className="mt-4">
            <Link
              href="/payment-voucher"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Voucher Detail</h3>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-sm font-medium text-gray-600">Subject: </span>
                <span className="text-sm text-gray-900">{item.subject}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Date: </span>
                <span className="text-sm text-gray-900">{fmtDate(item.date)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Prepared By: </span>
                <span className="text-sm text-gray-900">{item.preparedBy || '—'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Send To: </span>
                <span className="text-sm text-gray-900">{item.sendTo || '—'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status: </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Approved' ? 'text-green-600 bg-green-50' :
                  item.status === 'Rejected' ? 'text-red-600 bg-red-50' :
                  'text-orange-600 bg-orange-50'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            {/* Items Table */}
            {item.items && item.items.length > 0 && (
              <div className="mt-8">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Line Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-3 py-2 text-left font-medium">S/N</th>
                        <th className="border px-3 py-2 text-left font-medium">Class</th>
                        <th className="border px-3 py-2 text-left font-medium">Description</th>
                        <th className="border px-3 py-2 text-right font-medium">QTY</th>
                        <th className="border px-3 py-2 text-right font-medium">Unit Price (₦)</th>
                        <th className="border px-3 py-2 text-right font-medium">Amount (₦)</th>
                        <th className="border px-3 py-2 text-right font-medium">VAT %</th>
                        <th className="border px-3 py-2 text-right font-medium">VAT Amount (₦)</th>
                        <th className="border px-3 py-2 text-right font-medium">Gross Amount (₦)</th>
                        <th className="border px-3 py-2 text-right font-medium">WHT%</th>
                        <th className="border px-3 py-2 text-right font-medium">WHT Amount (₦)</th>
                        <th className="border px-3 py-2 text-right font-medium">Net Amount (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.items.map((row: any, idx: number) => (
                        <tr key={idx}>
                          <td className="border px-3 py-2">{row.sn}</td>
                          <td className="border px-3 py-2">{row.class}</td>
                          <td className="border px-3 py-2">{row.description}</td>
                          <td className="border px-3 py-2 text-right">{row.qty}</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(row.unitPrice)}</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(row.amount)}</td>
                          <td className="border px-3 py-2 text-right">{row.vatPercent}%</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(row.vatAmount)}</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(row.grossAmount)}</td>
                          <td className="border px-3 py-2 text-right">{row.whtPercent}%</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(row.whtAmount)}</td>
                          <td className="border px-3 py-2 text-right">{fmtAmt(row.netAmount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={4} className="border px-3 py-2 text-right">Total</td>
                        <td className="border px-3 py-2 text-right">{fmtAmt(item.totalUnitPrice)}</td>
                        <td className="border px-3 py-2 text-right">{fmtAmt(item.totalAmount)}</td>
                        <td className="border px-3 py-2"></td>
                        <td className="border px-3 py-2 text-right">{fmtAmt(item.totalVatAmount)}</td>
                        <td className="border px-3 py-2"></td>
                        <td className="border px-3 py-2"></td>
                        <td className="border px-3 py-2 text-right">{fmtAmt(item.totalWhtAmount)}</td>
                        <td className="border px-3 py-2 text-right">{fmtAmt(item.totalNetAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Net Amount in Words */}
            {item.netAmountInWords && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-600 mb-2">Net amount in words:</div>
                <div className="text-sm text-gray-900 italic">{item.netAmountInWords}</div>
              </div>
            )}

            {/* Beneficiary Payment Details */}
            {(item.accountName || item.accountNumber || item.bankName) && (
              <div className="mt-8">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Beneficiary Payment Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {item.accountName && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Account Name: </span>
                      <span className="text-sm text-gray-900">{item.accountName}</span>
                    </div>
                  )}
                  {item.accountNumber && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Account Number: </span>
                      <span className="text-sm text-gray-900">{item.accountNumber}</span>
                    </div>
                  )}
                  {item.bankName && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Bank Name: </span>
                      <span className="text-sm text-gray-900">{item.bankName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t flex items-center gap-3">
              <Link
                href="/payment-voucher"
                className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
              >
                Back to List
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
