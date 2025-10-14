'use client';

import Sidebar from '../../../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../../../components/dashboard/DashboardHeader';
import Card from '../../../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { api } from '../../../../../utils/api';
import { payslips, salaryDefinitions } from '../../../../../state/payroll';
import { useParams, useRouter } from 'next/navigation';

 type Payslip = {
  id: string;
  staffName: string;
  title: string;
  level: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  utilityAllowance: number;
  productivityAllowance: number;
  communicationAllowance: number;
  inconvenienceAllowance: number;
  grossSalary: number;
  taxPayee: number;
  employeePension: number;
  totalDeduction: number;
  netSalary: number;
};

export default function EditPayslipPage() {
  const router = useRouter();
  const params = useParams();
  const id = String((params as any)?.id || '');

  // Basic info
  const [staffName, setStaffName] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');

  // Salary structure
  const [basicSalary, setBasicSalary] = useState('');
  const [housingAllowance, setHousingAllowance] = useState('');
  const [transportAllowance, setTransportAllowance] = useState('');
  const [utilityAllowance, setUtilityAllowance] = useState('');
  const [productivityAllowance, setProductivityAllowance] = useState('');
  const [communicationAllowance, setCommunicationAllowance] = useState('');
  const [inconvenienceAllowance, setInconvenienceAllowance] = useState('');

  // Deductions
  const [taxPayee, setTaxPayee] = useState('');
  const [employeePension, setEmployeePension] = useState('');

  const parse = (v: string) => Number(String(v).replace(/[^0-9.\-]/g, '')) || 0;

  const grossSalary = useMemo(() => {
    return (
      parse(basicSalary) +
      parse(housingAllowance) +
      parse(transportAllowance) +
      parse(utilityAllowance) +
      parse(productivityAllowance) +
      parse(communicationAllowance) +
      parse(inconvenienceAllowance)
    );
  }, [basicSalary, housingAllowance, transportAllowance, utilityAllowance, productivityAllowance, communicationAllowance, inconvenienceAllowance]);

  const totalDeduction = useMemo(() => parse(taxPayee) + parse(employeePension), [taxPayee, employeePension]);
  const netSalary = useMemo(() => Math.max(0, grossSalary - totalDeduction), [grossSalary, totalDeduction]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffOptions, setStaffOptions] = useState<{ id: string; name: string }[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Load payslip
        const ps = await api<Payslip>(`/payroll/payslips/${id}`);
        if (!alive) return;
        setStaffName(ps.staffName || '');
        setTitle(ps.title || '');
        setLevel(ps.level || '');
        setBasicSalary(String(ps.basicSalary ?? ''));
        setHousingAllowance(String(ps.housingAllowance ?? ''));
        setTransportAllowance(String(ps.transportAllowance ?? ''));
        setUtilityAllowance(String(ps.utilityAllowance ?? ''));
        setProductivityAllowance(String(ps.productivityAllowance ?? ''));
        setCommunicationAllowance(String(ps.communicationAllowance ?? ''));
        setInconvenienceAllowance(String(ps.inconvenienceAllowance ?? ''));
        setTaxPayee(String(ps.taxPayee ?? ''));
        setEmployeePension(String(ps.employeePension ?? ''));
      } catch (e: any) {
        setError(e?.message || 'Failed to load payslip');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // users
    (async () => {
      try {
        const json = await api<{ items: any[] }>("/users");
        if (json?.items) setStaffOptions(json.items.map((u: any) => ({ id: String(u.id), name: u.name || `${u.firstName||''} ${u.lastName||''}`.trim() })));
      } catch {}
    })();

    // salary definitions
    const unsub = salaryDefinitions.subscribe((snap) => {
      if (snap.data) {
        const t = Array.from(new Set(snap.data.items.map((x) => x.title).filter(Boolean)));
        const l = Array.from(new Set(snap.data.items.map((x) => x.level).filter(Boolean)));
        setTitles(t);
        setLevels(l);
      }
    });
    salaryDefinitions.refresh().catch(() => void 0);
    return () => { alive = false; unsub(); };
  }, [id]);

  async function onUpdate() {
    setError(null);
    if (!staffName || !title || !level) {
      setError('Select staff, title and level');
      return;
    }
    if (grossSalary <= 0) {
      setError('Enter valid salary values');
      return;
    }
    setSubmitting(true);
    try {
      await api(`/payroll/payslips/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          staffName,
          title,
          level,
          basicSalary: parse(basicSalary),
          housingAllowance: parse(housingAllowance),
          transportAllowance: parse(transportAllowance),
          utilityAllowance: parse(utilityAllowance),
          productivityAllowance: parse(productivityAllowance),
          communicationAllowance: parse(communicationAllowance),
          inconvenienceAllowance: parse(inconvenienceAllowance),
          grossSalary,
          taxPayee: parse(taxPayee),
          employeePension: parse(employeePension),
          totalDeduction,
          netSalary,
        }),
      });
      payslips.refresh().catch(() => void 0);
      router.push(`/payroll/payslips/${id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to update payslip');
    } finally {
      setSubmitting(false);
    }
  }

  const fmtUSD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Payroll" subtitle="Generate and send payroll to account." />
          <div className="mt-4">
            <Link href={`/payroll/payslips/${id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* Basic Information */}
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Edit Payslip</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Staff name</Label>
                <div className="relative">
                  <select value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select staff</option>
                    {staffOptions.length === 0 ? (
                      <option value="">No staff found</option>
                    ) : (
                      staffOptions.map((o) => (
                        <option key={o.id} value={o.name}>{o.name}</option>
                      ))
                    )}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Title</Label>
                <div className="relative">
                  <select value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select title</option>
                    {titles.length === 0 ? (
                      <option value="">No titles found</option>
                    ) : (
                      titles.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))
                    )}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Level</Label>
                <div className="relative">
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select level</option>
                    {levels.length === 0 ? (
                      <option value="">No levels found</option>
                    ) : (
                      levels.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))
                    )}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
            </div>
          </Card>

          {/* Salary Structure */}
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Salary Structure</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Basic salary</Label>
                <Input placeholder="Enter amount" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Housing allowance</Label>
                <Input placeholder="Enter amount" value={housingAllowance} onChange={(e) => setHousingAllowance(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Transport allowance</Label>
                <Input placeholder="Enter amount" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Utility allowance</Label>
                <Input placeholder="Enter amount" value={utilityAllowance} onChange={(e) => setUtilityAllowance(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Productivity allowance</Label>
                <Input placeholder="Enter amount" value={productivityAllowance} onChange={(e) => setProductivityAllowance(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Communication allowance</Label>
                <Input placeholder="Enter amount" value={communicationAllowance} onChange={(e) => setCommunicationAllowance(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Inconvenience allowance</Label>
                <Input placeholder="Enter amount" value={inconvenienceAllowance} onChange={(e) => setInconvenienceAllowance(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Gross Salary</Label>
                <Input value={fmtUSD(grossSalary)} readOnly className="bg-gray-50" />
              </div>
            </div>
          </Card>

          {/* Deductions */}
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Deductions</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label className="block text-sm text-gray-600 mb-2">TAX/PAYE</Label>
                <Input placeholder="Enter amount" value={taxPayee} onChange={(e) => setTaxPayee(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Employee pension</Label>
                <Input placeholder="Enter amount" value={employeePension} onChange={(e) => setEmployeePension(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Total deduction</Label>
                <Input value={fmtUSD(totalDeduction)} readOnly className="bg-gray-50" />
              </div>
            </div>
          </Card>

          {/* Net Salary */}
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Net Salary</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Net salary</Label>
                <Input value={fmtUSD(netSalary)} readOnly className="bg-gray-50" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={onUpdate} disabled={submitting} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{submitting ? 'Saving...' : 'Save Changes'}</button>
              {error && <span className="text-sm text-rose-600">{error}</span>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
