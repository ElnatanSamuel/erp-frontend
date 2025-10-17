'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api, API_ORIGIN } from '../../utils/api';


type Stock = {
  id: string;
  name: string;
  productId?: string;
  category?: string;
  qtyPurchased?: number;
  unitPrice?: number;
  totalAmount?: number;
  inStock?: number;
  supplier?: string;
  imageName?: string;
  imageUrl?: string;
  status?: string;
  functioning?: number;
};

export default function StocksInventoryPage() {
  const [kpis, setKpis] = useState<{ categories: number; totalItems: number; totalCost: number; lowStock: number; totalSuppliers: number }|null>(null);
  const [items, setItems] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'stocks'|'inventory'>('inventory');

  useEffect(() => { (async () => { try { const r = await api('/stocks/kpis'); setKpis(r as any); } catch {} })(); }, []);
  useEffect(() => {
    let alive = true; setLoading(true); setError(null);
    (async () => {
      try {
        const view = tab; // 'stocks' | 'inventory'
        const r = await api<{ items: Stock[] }>(`/stocks?view=${encodeURIComponent(view)}`);
        if (!alive) return; setItems(r.items || []);
      }
      catch (e:any) { if (!alive) return; setError(e?.message || 'Failed to load'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [tab]);

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Stocks and Inventory" subtitle="Update stocks and inventory table" />
          <div className="mt-2 text-sm flex gap-6">
            <button onClick={()=>setTab('stocks')} className={`pb-2 -mb-[1px] border-b-2 ${tab==='stocks' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Stocks</button>
            <button onClick={()=>setTab('inventory')} className={`pb-2 -mb-[1px] border-b-2 ${tab==='inventory' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Inventory</button>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <KpiCard color="blue" value={kpis? kpis.categories : '—'} label="Categories" sub="2 more than last year"/>
            <KpiCard color="amber" value={kpis? kpis.totalItems : '—'} label="Total items" sub="10 more than last year"/>
            <KpiCard color="purple" value={kpis? formatMoney(kpis.totalCost) : '—'} label="Total item cost" sub="2.5% less than last year"/>
            {tab==='inventory' ? (
              <KpiCard color="yellow" value={kpis? kpis.totalSuppliers : '—'} label="Total suppliers" sub="2 more than last week"/>
            ) : (
              <KpiCard color="yellow" value={kpis? kpis.lowStock : '—'} label="Items low in stock" sub="2 less than last week"/>
            )}
          </div>

          {/* Update CTA */}
          <Card className="p-6 lg:p-7 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">{tab==='inventory' ? 'Update Inventory Table' : 'Update Stock List'}</h3>
            <Link href="/stocks-inventory/update" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">{tab==='inventory' ? 'Update Inventory' : 'Update Stock'}</Link>
          </Card>

          {/* Table */}
          <Card className="p-0">
            <div className="px-6 pt-5">
              <h3 className="text-base font-semibold text-gray-900">{tab==='inventory' ? 'Inventory List' : 'Stock List'}</h3>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3">S/N</th>
                    <th className="px-6 py-3">Image</th>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3">Product ID</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">QTY Purchased</th>
                    <th className="px-6 py-3">Unit Price</th>
                    <th className="px-6 py-3">Total Amount</th>
                    {tab==='stocks' && (<th className="px-6 py-3">In-Stock</th>)}
                    <th className="px-6 py-3">Supplier</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="px-6 py-10 text-gray-500" colSpan={tab==='stocks' ? 11 : 10}>Loading…</td></tr>
                  ) : error ? (
                    <tr><td className="px-6 py-10 text-rose-600" colSpan={tab==='stocks' ? 11 : 10}>{error}</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td className="px-6 py-10 text-gray-500" colSpan={tab==='stocks' ? 11 : 10}>No items</td></tr>
                  ) : (
                    items.map((t, i) => (
                      <tr key={t.id} className="border-b last:border-b-0">
                        <td className="px-6 py-4 text-gray-500">{String(i+1).padStart(2,'0')}</td>
                        <td className="px-6 py-4">
                          {t.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={(t.imageUrl||'').startsWith('http')? (t.imageUrl as string) : `${API_ORIGIN}${t.imageUrl}`} alt={t.name} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900">{t.name}</td>
                        <td className="px-6 py-4 text-gray-700">{t.productId || '—'}</td>
                        <td className="px-6 py-4 text-gray-700">{t.category || '—'}</td>
                        <td className="px-6 py-4 text-gray-700">{t.qtyPurchased ?? 0}{typeof t.qtyPurchased==='number' ? 'pcs' : ''}</td>
                        <td className="px-6 py-4 text-gray-700">{formatMoney(t.unitPrice || 0)}</td>
                        <td className="px-6 py-4 text-gray-700">{formatMoney(t.totalAmount || 0)}</td>
                        {tab==='stocks' && (<td className="px-6 py-4 text-gray-700">{t.inStock ?? 0}</td>)}
                        <td className="px-6 py-4 text-gray-700">{t.supplier || '—'}</td>
                        <td className="px-6 py-4">{tab==='inventory' ? renderInventoryStatus(t) : renderStockStatus(t.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          
        </div>
      </div>
    </div>
  );
}

function formatMoney(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }
function renderStockStatus(s?: string) {
  const text = s || 'In stock';
  const cls = text === 'Out of Stock' ? 'text-rose-600' : text === 'Low in Stock' ? 'text-amber-600' : 'text-emerald-600';
  return <span className={cls}>{text}</span>;
}
function renderInventoryStatus(t: Stock) {
  const qty = Number(t.qtyPurchased ?? 0);
  const func = Number(t.functioning ?? qty);
  if (func >= qty && qty > 0) return <span className="text-emerald-600">All functioning</span>;
  if (func <= 0) return <span className="text-rose-600">Not functioning</span>;
  return <span className="text-amber-600">{func} functioning</span>;
}
function KpiCard({ color, value, label, sub }: { color: 'blue'|'amber'|'purple'|'yellow'; value: any; label: string; sub: string }) {
  const map: any = { blue: 'text-blue-600 bg-blue-50', amber: 'text-amber-600 bg-amber-50', purple: 'text-purple-600 bg-purple-50', yellow: 'text-yellow-600 bg-yellow-50' };
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${map[color]}`}>
        <svg viewBox="0 0 24 24" className={`h-6 w-6 ${map[color].split(' ')[0]}`} fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
      </div>
      <div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xs text-emerald-600 mt-1">{sub}</div>
      </div>
    </Card>
  );
}
