'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import { salaryDefinitions, payrollKpis } from '../../../state/payroll';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

export default function CreateSalaryDefinitionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [basic, setBasic] = useState('');
  const [allowance, setAllowance] = useState('');
  const [gross, setGross] = useState('');
  const [deductions, setDeductions] = useState('');
  const [net, setNet] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (!title || !level) {
      setError('Please select Title and Level');
      return;
    }
    const parse = (v: string) => Number(String(v).replace(/[^0-9.\-]/g, '')) || 0;
    const basicSalary = parse(basic);
    const allowanceAmt = parse(allowance);
    const grossSalary = parse(gross);
    const deductionsAmt = parse(deductions);
    let netSalary = parse(net);
    if (!net || !isFinite(netSalary)) {
      netSalary = Math.max(0, grossSalary - deductionsAmt);
    }
    if (grossSalary <= 0) {
      setError('Enter a valid Gross Salary');
      return;
    }

    setSubmitting(true);
    try {
      await api('/payroll/definitions', {
        method: 'POST',
        body: JSON.stringify({
          title,
          level,
          basicSalary,
          allowance: allowanceAmt,
          grossSalary,
          deductions: deductionsAmt,
          netSalary,
        }),
      });
      // refresh list and go back
      salaryDefinitions.refresh().catch(() => void 0);
      payrollKpis.refresh().catch(() => void 0);
      router.push('/payroll');
    } catch (e: any) {
      setError(e?.message || 'Failed to create salary definition');
    } finally {
      setSubmitting(false);
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
            <h3 className="text-base font-semibold text-gray-900">Create Salary Definition</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Title */}
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Title</Label>
                <div className="relative">
                  <select value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select option</option>
                    <option>Managing Director</option>
                    <option>Executive Director</option>
                    <option>General Manager</option>
                    <option>Deputy General Manager</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              {/* Level */}
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Level</Label>
                <div className="relative">
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select option</option>
                    <option>MD/CEO</option>
                    <option>ED</option>
                    <option>GM</option>
                    <option>DGM</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>

              {/* Basic salary */}
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Basic salary</Label>
                <Input placeholder="Enter amount in Dollars" value={basic} onChange={(e) => setBasic(e.target.value)} />
              </div>

              {/* Allowance */}
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Allowance</Label>
                <Input placeholder="Enter amount in Dollars" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
              </div>

              {/* Gross Salary */}
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Gross Salary</Label>
                <Input placeholder="Enter amount in Dollars" value={gross} onChange={(e) => setGross(e.target.value)} />
              </div>

              {/* Deductions */}
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Deductions</Label>
                <Input placeholder="Enter amount in Dollars" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
              </div>

              {/* Net Salary */}
              <div className="md:col-span-3">
                <Label className="block text-sm text-gray-600 mb-2">Net Salary</Label>
                <div className="flex items-center gap-4">
                  <Input className="flex-1" placeholder="Enter amount in Dollars" value={net} onChange={(e) => setNet(e.target.value)} />
                  <button onClick={onSubmit} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{submitting ? 'Creating...' : 'Create'}</button>
                </div>
                {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
              </div>
            </div>
          </Card>

          
        </div>
      </div>
    </div>
  );
}
