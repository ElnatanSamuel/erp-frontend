'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useReducer, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api, apiMultipart, API_ORIGIN } from '../../../utils/api';


type Form = {
  name: string;
  productId: string;
  category: string;
  qtyPurchased: string;
  unitPrice: string;
  supplier: string;
  imageName?: string;
  imageUrl?: string;
};

function reducer(s: Form, p: Partial<Form>): Form { return { ...s, ...p }; }

export default function UpdateStockPage() {
  const [form, setForm] = useReducer(reducer, { name: '', productId: '', category: '', qtyPurchased: '', unitPrice: '', supplier: '', imageName: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const totalAmount = (() => {
    const qty = Number((form.qtyPurchased||'').replace(/,/g,'')) || 0;
    const price = Number((form.unitPrice||'').replace(/,/g,'')) || 0;
    return qty * price;
  })();

  function onPickImageClick() { (document.getElementById('stock_image_input') as HTMLInputElement | null)?.click(); }
  function onImageChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null; setPhotoFile(f);
    if (f) {
      const url = URL.createObjectURL(f); setPhotoPreview(url);
    } else { setPhotoPreview(null); }
  }

  async function onSubmit() {
    setError(null);
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.qtyPurchased) { setError('Quantity is required'); return; }
    if (!form.unitPrice) { setError('Unit price is required'); return; }
    setSubmitting(true);
    try {
      // Upload image first if selected and not yet uploaded
      let imagePayload: { imageName?: string; imageUrl?: string } = {};
      if (photoFile) {
        const fd = new FormData(); fd.append('file', photoFile);
        const up = await apiMultipart<{ name: string; url: string }>(`/stocks/upload`, fd);
        imagePayload = { imageName: up.name, imageUrl: up.url };
      } else if (form.imageUrl) {
        imagePayload = { imageName: form.imageName, imageUrl: form.imageUrl };
      }
      await api('/stocks', { method: 'POST', body: JSON.stringify({
        name: form.name, productId: form.productId, category: form.category,
        qtyPurchased: Number((form.qtyPurchased||'').replace(/,/g,'')) || 0,
        unitPrice: Number((form.unitPrice||'').replace(/,/g,'')) || 0,
        totalAmount, supplier: form.supplier,
        ...imagePayload,
      }) });
      window.location.href = '/stocks-inventory';
    } catch (e:any) { setError(e?.message || 'Failed to add item'); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Update Inventory" subtitle="Add new item to stocks" />
          <div className="mt-4">
            <Link href="/stocks-inventory" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Add New Item</h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Upload card */}
              <div className="md:col-span-1">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="mx-auto w-full max-w-[300px]">
                    <div className="min-h-[380px] rounded-xl border border-gray-200 grid place-items-center py-6">
                      <div className="text-center">
                        <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden">
                          {photoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photoPreview} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
                          ) : (
                            <>
                              <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-[#D9DEE7]" />
                              <div className="absolute inset-3 rounded-full bg-[#F6F8FB] grid place-items-center">
                                <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center">
                                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500" fill="currentColor"><path d="M12 5l2 2h3a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h3l2-2zm0 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
                                </div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="mt-24 text-sm text-gray-600">Upload photo</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-3">
                          <label htmlFor="stock_image_input" className="inline-flex items-center h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 cursor-pointer hover:bg-gray-50">Choose photo</label>
                          <input id="stock_image_input" type="file" accept="image/*" onChange={onImageChosen} className="hidden" />
                          <span className="max-w-[180px] text-sm text-gray-600 truncate align-middle">{photoFile?.name ? (photoFile.name.length > 28 ? `${photoFile.name.slice(0,14)}…${photoFile.name.slice(-10)}` : photoFile.name) : 'No file chosen'}</span>
                        </div>
                        <div className="mt-6 text-xs text-gray-500 text-center">
                          <div>Allowed format</div>
                          <div className="font-medium text-gray-700">JPG, JPEG, and PNG</div>
                          <div className="mt-3">Max file size</div>
                          <div className="font-medium text-gray-700">2MB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Product name</label>
                  <Input placeholder="Enter product name" value={form.name} onChange={(e)=>setForm({ name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Product ID</label>
                  <Input placeholder="Enter ID" value={form.productId} onChange={(e)=>setForm({ productId: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={(e)=>setForm({ category: e.target.value })} className="w-full h-11 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700">
                      <option value="">Select category</option>
                      {['Stationaries','Detergent','Electronics','Food','Others'].map((x)=> <option key={x} value={x}>{x}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">QTY purchased</label>
                  <Input placeholder="Enter quantity" value={form.qtyPurchased} onChange={(e)=>setForm({ qtyPurchased: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Unit price</label>
                  <Input placeholder="Enter amount" value={form.unitPrice} onChange={(e)=>setForm({ unitPrice: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Total amount</label>
                  <Input disabled value={totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-2">Supplier</label>
                  <Input placeholder="Enter supplier name" value={form.supplier} onChange={(e)=>setForm({ supplier: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={onSubmit} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{submitting ? 'Adding…' : 'Add Item'}</button>
              {error && <span className="ml-4 text-sm text-rose-600">{error}</span>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
