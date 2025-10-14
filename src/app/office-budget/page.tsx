'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BlueShieldCurrency, OrangeBag, PurplePurse, GreenMoneyBag } from '../../components/budget/BudgetIcons';
import { budgetEntries, budgetKpis } from '../../state/budget';

export default function OfficeBudgetPage() {
  const [perPage, setPerPage] = useState(16);
  const [entries, setEntries] = useState<{ id: string; budgetNo: string; description: string; amountUsd: number; date: string }[]>([]);
  const [kpis, setKpis] = useState<{ totalAnnualUsd: number; usedUsd: number; balanceUsd: number; percentUsed: number } | null>(null);

  useEffect(() => {
    const unsub1 = budgetEntries.subscribe((snap) => {
      if (snap.data) setEntries(snap.data.items);
    });
    const unsub2 = budgetKpis.subscribe((snap) => {
      if (snap.data) setKpis(snap.data);
    });
    budgetEntries.refresh().catch(() => void 0);
    budgetKpis.refresh().catch(() => void 0);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const fmtUSD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Office Budget" subtitle="View, create and send budget request." />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-gray-900">{kpis ? fmtUSD(kpis.totalAnnualUsd) : '—'}</div>
                <div className="text-sm text-gray-500">Total annual budget</div>
                <div className="mt-1 text-xs text-emerald-600">↑ 5% more than last year</div>
              </div>
              <BlueShieldCurrency className="h-12 w-12" />
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-gray-900">{kpis ? fmtUSD(kpis.usedUsd) : '—'}</div>
                <div className="text-sm text-gray-500">Amount used, YTD</div>
              </div>
              <OrangeBag className="h-12 w-12" />
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-gray-900">{kpis ? fmtUSD(kpis.balanceUsd) : '—'}</div>
                <div className="text-sm text-gray-500">Total budget balance</div>
              </div>
              <PurplePurse className="h-12 w-12" />
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold text-gray-900">{kpis ? `${kpis.percentUsed}%` : '—'}</div>
                <div className="text-sm text-gray-500">Budget % used</div>
              </div>
              <GreenMoneyBag className="h-12 w-12" />
            </div>
          </div>

          {/* Create a Budget */}
          <Card className="p-6 lg:p-7 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Create a Budget</h3>
            </div>
            <Link href="/office-budget/new" className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">
              Create Budget
            </Link>
          </Card>

          {/* Budget History */}
          <Card className="p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Budget History</h3>
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
                    <th className="px-5 py-3 font-medium">Budget No.</th>
                    <th className="px-5 py-3 font-medium">Budget Description</th>
                    <th className="px-5 py-3 font-medium">Amount (USD)</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, perPage).map((r, idx) => {
                    const d = new Date(r.date);
                    const dd = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                    return (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-4">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4">{r.budgetNo}</td>
                        <td className="px-5 py-4 text-gray-900">{r.description}</td>
                        <td className="px-5 py-4">{fmtUSD(r.amountUsd)}</td>
                        <td className="px-5 py-4">{dd}</td>
                        <td className="px-5 py-4 text-blue-600">View more</td>
                      </tr>
                    );
                  })}
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
