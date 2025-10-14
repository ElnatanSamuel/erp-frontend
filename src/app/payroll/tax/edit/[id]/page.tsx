'use client';

import Sidebar from '../../../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../../../components/dashboard/DashboardHeader';
import Card from '../../../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { api } from '../../../../../utils/api';
import { taxDefinitions } from '../../../../../state/payroll';

export default function EditTaxDefinitionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [taxType, setTaxType] = useState('');
  const [percent, setPercent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await api<{ taxType: string; percent: number }>(`/payroll/taxes/${id}`);
        if (ignore) return;
        setTaxType(data.taxType || '');
        setPercent(String(data.percent ?? ''));
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
    return () => { ignore = true; };
  }, [id]);

  async function onSave() {
    setError(null);
    const p = Number(String(percent).replace(/[^0-9.\-]/g, ''));
    if (!taxType || !isFinite(p) || p < 0) {
      setError('Enter a valid tax type and % value');
      return;
    }
    setSaving(true);
    try {
      await api(`/payroll/taxes/${id}`, { method: 'PUT', body: JSON.stringify({ taxType, percent: p }) });
      await taxDefinitions.refresh();
      router.push('/payroll?tab=tax');
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Payroll" subtitle="Generate and send payroll to account." />
          <div className="mt-4">
            <Link href="/payroll?tab=tax" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Edit Tax Definition</h3>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}

            {!loading && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Tax type</Label>
                  <Input placeholder="Enter tax name" value={taxType} onChange={(e) => setTaxType(e.target.value)} />
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">% value</Label>
                  <Input placeholder="Enter % value" value={percent} onChange={(e) => setPercent(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <button onClick={onSave} disabled={saving} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
