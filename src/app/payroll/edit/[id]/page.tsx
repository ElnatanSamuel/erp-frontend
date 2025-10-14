'use client';

import Sidebar from '../../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../../components/dashboard/DashboardHeader';
import Card from '../../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { api } from '../../../../utils/api';
import { salaryDefinitions, payrollKpis } from '../../../../state/payroll';

export default function EditSalaryDefinitionPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [basic, setBasic] = useState('');
  const [allowance, setAllowance] = useState('');
  const [gross, setGross] = useState('');
  const [deductions, setDeductions] = useState('');
  const [net, setNet] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await api<{ title: string; level: string; basicSalary: number; allowance: number; grossSalary: number; deductions: number; netSalary: number }>(`/payroll/definitions/${id}`);
        if (ignore) return;
        setTitle(data.title || '');
        setLevel(data.level || '');
        setBasic(String(data.basicSalary ?? ''));
        setAllowance(String(data.allowance ?? ''));
        setGross(String(data.grossSalary ?? ''));
        setDeductions(String(data.deductions ?? ''));
        setNet(String(data.netSalary ?? ''));
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
    const parse = (v: string) => Number(String(v).replace(/[^0-9.\-]/g, '')) || 0;
    setSaving(true);
    try {
      await api(`/payroll/definitions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          level,
          basicSalary: parse(basic),
          allowance: parse(allowance),
          grossSalary: parse(gross),
          deductions: parse(deductions),
          netSalary: parse(net),
        }),
      });
      await salaryDefinitions.refresh();
      payrollKpis.refresh().catch(() => void 0);
      router.push('/payroll');
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
            <Link href="/payroll" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Edit Salary Definition</h3>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}

            {!loading && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Title</Label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Level</Label>
                  <input value={level} onChange={(e) => setLevel(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Basic salary</Label>
                  <Input placeholder="Enter amount" value={basic} onChange={(e) => setBasic(e.target.value)} />
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Allowance</Label>
                  <Input placeholder="Enter amount" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Gross Salary</Label>
                  <Input placeholder="Enter amount" value={gross} onChange={(e) => setGross(e.target.value)} />
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Deductions</Label>
                  <Input placeholder="Enter amount" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
                </div>
                <div className="md:col-span-3">
                  <Label className="block text-sm text-gray-600 mb-2">Net Salary</Label>
                  <div className="flex items-center gap-4">
                    <Input className="flex-1" placeholder="Enter amount" value={net} onChange={(e) => setNet(e.target.value)} />
                    <button onClick={onSave} disabled={saving} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
