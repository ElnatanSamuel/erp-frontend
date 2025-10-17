'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { api } from '../../../utils/api';
import { payslips, salaryDefinitions } from '../../../state/payroll';

 type UserLite = { id: string; name: string; designation?: string };
 type Def = { id: string; title: string; level: string; basicSalary: number; allowance: number; grossSalary: number; deductions: number; netSalary: number };

export default function GeneratePayrollPage() {
  const [paymentName, setPaymentName] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0,10));
  const [payMonth, setPayMonth] = useState('');
  const [payYear, setPayYear] = useState('');
  const [selectedDefId, setSelectedDefId] = useState('');

  const [users, setUsers] = useState<UserLite[]>([]);
  const [defs, setDefs] = useState<Def[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState<Array<{
    user: UserLite;
    def: Def;
  }>>([]);

  useEffect(() => {
    const unsub = salaryDefinitions.subscribe((snap) => {
      if (snap.data) setDefs(snap.data.items);
    });
    salaryDefinitions.refresh().catch(() => void 0);
    (async () => {
      try {
        const json = await api<{ items: any[] }>('/users');
        if (json?.items) setUsers(json.items.map((u: any) => ({ id: String(u.id), name: u.name || `${u.firstName||''} ${u.lastName||''}`.trim(), designation: u.designation })));
      } catch {}
    })();
    return () => { unsub(); };
  }, []);

  const designationOptions = useMemo(() => {
    // Source of truth: staff designations, so the dropdown always matches what staff have
    const dset = new Set<string>();
    for (const u of users) if (u.designation) dset.add(u.designation);
    // Fallback: salary definition titles (in case users list is empty)
    if (dset.size === 0) {
      for (const d of defs) if (d.title) dset.add(d.title);
    }
    return Array.from(dset);
  }, [users, defs]);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(now - 2 + i));
  }, []);

  const filteredUsers = useMemo(() => {
    if (!designation) return [];
    return users.filter(u => (u.designation || '').trim().toLowerCase() === designation.trim().toLowerCase());
  }, [users, designation]);

  function fmtUSD(n: number) {
    return (Number(n)||0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  function onGenerate() {
    setError(null);
    if (!paymentName || !designation || !payMonth || !payYear || !dateStr) {
      setError('Payment name, designation, date, month and year are required');
      return;
    }
    if (filteredUsers.length === 0) {
      setError('No staff found for selected designation');
      return;
    }
    // Map each user to a salary definition by matching either title or level
    const rows: Array<{ user: UserLite; def: Def }> = [];
    const missing: string[] = [];
    const norm = (s?: string) => (s || '').trim().toLowerCase();
    const acronym = (s?: string) => (s||'').replace(/[^A-Za-z]/g,' ').split(/\s+/).filter(Boolean).map(w=>w[0]?.toUpperCase()||'').join('');
    const fallbackDef = defs.find(d => d.id === selectedDefId) || defs[0];
    for (const u of filteredUsers) {
      const dsg = u.designation || designation;
      const m = defs.find(d =>
        norm(d.title) === norm(dsg) ||
        norm(d.level) === norm(dsg) ||
        norm(d.title).includes(norm(dsg)) ||
        norm(dsg).includes(norm(d.title)) ||
        norm(d.level).includes(norm(dsg)) ||
        acronym(d.title) === acronym(dsg) ||
        acronym(d.level) === acronym(dsg)
      );
      if (m) rows.push({ user: u, def: m }); else if (fallbackDef) rows.push({ user: u, def: fallbackDef }); else missing.push(u.name);
    }
    if (rows.length === 0) {
      setError('No salary definition available. Please create one in Salary Breakdown.');
      return;
    }
    if (missing.length > 0) setError(`No salary definition for ${missing.length} staff; using fallback for others`);
    // Append while de-duplicating by (user.id + designation)
    setGenerated((prev) => {
      const norm = (s?: string) => (s || '').trim().toLowerCase();
      const keyOf = (u: UserLite) => `${norm(u.name)}|${norm(u.designation || designation)}`;
      const seen = new Set(prev.map((r) => keyOf(r.user)));
      const toAdd = rows.filter((r) => {
        const k = keyOf(r.user);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      return [...prev, ...toAdd];
    });
  }

  async function onSubmit() {
    setError(null);
    if (!generated.length) {
      setError('Generate payroll first');
      return;
    }
    if (!paymentName || !designation || !payMonth || !payYear || !dateStr) {
      setError('Payment name, designation, date, month and year are required');
      return;
    }
    setSubmitting(true);
    try {
      const items = generated.map(({ user, def }) => ({
        staffName: user.name,
        title: def.title,
        level: def.level,
        paymentName,
        payMonth,
        payYear,
        basicSalary: def.basicSalary,
        housingAllowance: def.allowance, // allocate total allowance to one bucket for now
        transportAllowance: 0,
        utilityAllowance: 0,
        productivityAllowance: 0,
        communicationAllowance: 0,
        inconvenienceAllowance: 0,
        grossSalary: def.grossSalary,
        taxPayee: def.deductions,
        employeePension: 0,
        totalDeduction: def.deductions,
        netSalary: def.netSalary,
      }));
      await api('/payroll/payslips/batch', { method: 'POST', body: JSON.stringify({ items, date: dateStr }) });
      await payslips.refresh();
      window.location.href = '/payroll?tab=payroll';
    } catch (e: any) {
      setError(e?.message || 'Failed to generate payroll');
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
            <Link href="/payroll?tab=payroll" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* Generate Form */}
          <Card className="p-6 lg:p-7">
            <h3 className="text-base font-semibold text-gray-900">Generate Payroll</h3>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Payment name</Label>
                <Input placeholder="Enter payment name" value={paymentName} onChange={(e) => setPaymentName(e.target.value)} />
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Designation</Label>
                <div className="relative">
                  <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select designation</option>
                    {designationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Salary definition (optional override)</Label>
                <div className="relative">
                  <select value={selectedDefId} onChange={(e) => setSelectedDefId(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Auto-match from designation</option>
                    {defs.map((d) => (
                      <option key={d.id} value={d.id}>{d.title} {d.level ? `- ${d.level}` : ''}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Date generated</Label>
                <div className="relative">
                  <Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="pr-10" />
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10h10v2H7zm0 4h10v2H7z"/></svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Payment month</Label>
                <div className="relative">
                  <select value={payMonth} onChange={(e) => setPayMonth(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
              <div>
                <Label className="block text-sm text-gray-600 mb-2">Payment year</Label>
                <div className="relative">
                  <select value={payYear} onChange={(e) => setPayYear(e.target.value)} className="w-full h-12 appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option value="">Select year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button onClick={onGenerate} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Generate Payroll</button>
              {error && <span className="ml-3 text-sm text-rose-600">{error}</span>}
            </div>
          </Card>

          {/* Staff Details */}
          <Card className="p-0">
            <div className="p-5 pb-0">
              <h3 className="text-base font-semibold text-gray-900">Staff Details</h3>
            </div>
            <div className="p-5 pt-3">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-y bg-gray-50">
                      <th className="px-5 py-3 font-medium">S/N</th>
                      <th className="px-5 py-3 font-medium">Staff Name</th>
                      <th className="px-5 py-3 font-medium">Title</th>
                      <th className="px-5 py-3 font-medium">Level</th>
                      <th className="px-5 py-3 font-medium">Basic Salary</th>
                      <th className="px-5 py-3 font-medium">Allowances</th>
                      <th className="px-5 py-3 font-medium">Gross Salary</th>
                      <th className="px-5 py-3 font-medium">Deduction</th>
                      <th className="px-5 py-3 font-medium">Net Salary</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generated.length === 0 ? (
                      <tr><td className="px-5 py-8 text-sm text-gray-500" colSpan={10}>No staff generated yet. Select designation and click Generate Payroll.</td></tr>
                    ) : (
                      generated.map(({ user, def }, i) => (
                        <tr key={user.id} className="border-b last:border-0">
                          <td className="px-5 py-4">{String(i+1).padStart(2,'0')}</td>
                          <td className="px-5 py-4 text-gray-900">{user.name}</td>
                          <td className="px-5 py-4">{def.title}</td>
                          <td className="px-5 py-4">{def.level}</td>
                          <td className="px-5 py-4">{fmtUSD(def.basicSalary)}</td>
                          <td className="px-5 py-4">{fmtUSD(def.allowance)}</td>
                          <td className="px-5 py-4">{fmtUSD(def.grossSalary)}</td>
                          <td className="px-5 py-4">{fmtUSD(def.deductions)}</td>
                          <td className="px-5 py-4">{fmtUSD(def.netSalary)}</td>
                          <td className="px-5 py-4 text-blue-600">
                            <button onClick={() => setGenerated((prev)=> prev.filter((r)=> !(r.user.id===user.id && (r.user.designation||'')===(user.designation||''))))} className="hover:underline">Remove</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-5">
                <button onClick={onSubmit} disabled={submitting || generated.length===0} className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit'}</button>
              </div>
            </div>
          </Card>

          
        </div>
      </div>
    </div>
  );
}
