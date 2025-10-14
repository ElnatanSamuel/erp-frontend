'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../utils/api';

type Voucher = {
  id: string;
  subject: string;
  date: string;
  preparedBy: string;
  sendTo: string;
};

export default function PaymentVoucherPage() {
  const [q, setQ] = useState('');
  const [perPage, setPerPage] = useState(16);
  const [items, setItems] = useState<Voucher[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fmtDate = (d: any) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB');
    } catch {
      return '—';
    }
  };

  useEffect(() => {
    loadData();
  }, [q, perPage]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await api<{ items: Voucher[]; total: number }>(
        `/payment-voucher?q=${encodeURIComponent(q)}&limit=${perPage}`
      );
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Payment Voucher" subtitle="Create payment voucher" />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* Top: total + filter + button */}
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-semibold text-gray-900">{total}</div>
                  <div className="text-sm text-gray-500">Total payment vouchers</div>
                </div>
                <div className="relative">
                  <select
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="h-11 rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 min-w-[170px]"
                  >
                    <option value="">All memos</option>
                    <option value="fars">FARS</option>
                    <option value="request">Requests</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <Link
                href="/payment-voucher/create"
                className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
              >
                Create Payment Voucher
              </Link>
            </div>
          </Card>

          {/* Table */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">All Payment Vouchers</h3>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Showing</span>
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:outline-none"
                  >
                    {[8, 16, 24, 32].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
                <span>per page</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-5 py-3 font-medium">S/N</th>
                    <th className="px-5 py-3 font-medium">Subject</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Prepared By</th>
                    <th className="px-5 py-3 font-medium">Send To</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                        No payment vouchers found
                      </td>
                    </tr>
                  ) : (
                    items.map((v, idx) => (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-4">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4 text-gray-900">{v.subject}</td>
                        <td className="px-5 py-4">{fmtDate(v.date)}</td>
                        <td className="px-5 py-4">{v.preparedBy || '—'}</td>
                        <td className="px-5 py-4">{v.sendTo || '—'}</td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/payment-voucher/${v.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View more
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <footer className="text-center text-xs text-gray-400 pt-2 pb-6">Copyright © 2025 Relia Energy. All Rights Reserved</footer>
        </div>
      </div>
    </div>
  );
}
