'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../utils/api';

export default function ProcurementPage() {
  const [kpis, setKpis] = useState({ total: 0, totalAmount: 0, pending: 0, approved: 0 });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const limit = 10;

  useEffect(() => {
    loadKpis();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, searchQuery, statusFilter]);

  async function loadKpis() {
    try {
      const res = await api<any>('/procurement/kpis');
      setKpis(res);
    } catch {}
  }

  async function loadItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (statusFilter !== 'All') params.set('status', statusFilter);
      const res = await api<any>(`/procurement?${params}`);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const fmtAmt = (n: number) =>
    Number.isFinite(n)
      ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';

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

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader
            title="Procurement"
            subtitle="Request for, view and track all requested procurements."
          />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-50 grid place-items-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-600">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.68l1.74-8H6L5.27 2H2v2h2l3.6 7.59L5.25 17h13.5v-2H7.16z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{kpis.total}</div>
                  <div className="text-sm text-gray-500">Total request made</div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-50 grid place-items-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-purple-600">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">${fmtAmt(kpis.totalAmount)}</div>
                  <div className="text-sm text-gray-500">Total cost incurred</div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-50 grid place-items-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-orange-600">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{kpis.pending}</div>
                  <div className="text-sm text-gray-500">Pending request</div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-50 grid place-items-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-green-600">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{kpis.approved}</div>
                  <div className="text-sm text-gray-500">Approved request</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Procurement Request Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Procurement Request</h3>
              <Link
                href="/procurement/create"
                className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm text-sm"
              >
                Make Procurement Request
              </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-5">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-y bg-gray-50">
                    <th className="px-5 py-3 font-medium">S/N</th>
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 font-medium">Qty</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Requested By</th>
                    <th className="px-5 py-3 font-medium">Sent to</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                        No procurement requests found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-4">{String(idx + 1 + (page - 1) * limit).padStart(2, '0')}</td>
                        <td className="px-5 py-4 text-gray-900">{item.itemName}</td>
                        <td className="px-5 py-4">{item.quantity}</td>
                        <td className="px-5 py-4">${fmtAmt(item.totalPrice || 0)}</td>
                        <td className="px-5 py-4">{item.requestedBy || '—'}</td>
                        <td className="px-5 py-4">{item.sentTo || '—'}</td>
                        <td className="px-5 py-4">{fmtDate(item.date)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/procurement/${item.id}`}
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

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between mt-5 pt-5 border-t">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 px-4 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * limit >= total}
                    className="h-9 px-4 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
