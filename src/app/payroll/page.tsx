'use client';

import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Card from '../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { payrollKpis, payrollSummary, salaryDefinitions, taxDefinitions, payslips, type PayslipListItem } from '../../state/payroll';
import { api } from '../../utils/api';

export const dynamic = 'force-dynamic';

function KpiIcon({ colorFrom, colorTo, children }: { colorFrom: string; colorTo: string; children?: React.ReactNode }) {
  return (
    <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: `linear-gradient(145deg, ${colorFrom}20, ${colorTo}20)` }}>
      <div className="h-6 w-6 text-transparent" style={{ WebkitTextFillColor: 'currentcolor' }}>
        {children}
      </div>
    </div>
  );
}

function KpiCard({ value, label, icon, trend }: { value: string; label: string; icon: React.ReactNode; trend?: { up?: boolean; text: string } }) {
  return (
    <Card className="p-5 flex items-start gap-4">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-2xl font-semibold text-gray-900 leading-none">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
        {trend && (
          <div className={`mt-2 text-xs ${trend.up ? 'text-emerald-600' : 'text-rose-600'}`}>{trend.up ? '↑ ' : '↓ '}{trend.text}</div>
        )}
      </div>
    </Card>
  );
}

function segPath(x: number, y: number, w: number, h: number, rt: number, rb: number) {
  const rtx = Math.max(0, Math.min(rt, w / 2, h / 2));
  const rbx = Math.max(0, Math.min(rb, w / 2, h / 2));
  const x0 = x, y0 = y, x1 = x + w, y1 = y + h;
  return [
    `M ${x0 + rtx} ${y0}`,
    `H ${x1 - rtx}`,
    rtx ? `Q ${x1} ${y0} ${x1} ${y0 + rtx}` : `L ${x1} ${y0}`,
    `V ${y1 - rbx}`,
    rbx ? `Q ${x1} ${y1} ${x1 - rbx} ${y1}` : `L ${x1} ${y1}`,
    `H ${x0 + rbx}`,
    rbx ? `Q ${x0} ${y1} ${x0} ${y1 - rbx}` : `L ${x0} ${y1}`,
    `V ${y0 + rtx}`,
    rtx ? `Q ${x0} ${y0} ${x0 + rtx} ${y0}` : `L ${x0} ${y0}`,
    'Z',
  ].join(' ');
}

function Seg({ x, y, h, color, w = 16, rt = 0, rb = 0 }: { x: number; y: number; h: number; color: string; w?: number; rt?: number; rb?: number }) {
  if (h <= 0) return null;
  return <path d={segPath(x, y, w, h, rt, rb)} fill={color} />;
}

function PayrollBarChart({ months, netK, taxK, loanK }: { months: string[]; netK: number[]; taxK: number[]; loanK: number[] }) {
  // Data is passed in as thousands to align ticks (0k..600k)
  const max = 650; // y-axis cap (thousands)

  const h = 240; const w = 560; const padL = 40; const padB = 28; const chartW = w - padL - 10; const chartH = h - padB - 10;
  const scaleY = (v: number) => chartH - (v / max) * chartH + 10; // for gridlines
  const toHeight = (v: number) => (v / max) * chartH; // pixel height
  const barSpace = chartW / months.length; // group width

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full">
      {/* Title */}
      <text x={padL} y={22} fontSize={16} fontWeight={600} fill="#0F172A">Annual payroll summary</text>

      {/* Legend */}
      <g transform={`translate(${w - 250}, 10)`}>
        <circle cx={8} cy={8} r={6} fill="#1D75FF"/>
        <text x={22} y={12} fontSize={12} fill="#1f2937">Net salary</text>
        <circle cx={108} cy={8} r={6} fill="#FF9F1C"/>
        <text x={122} y={12} fontSize={12} fill="#1f2937">Tax</text>
        <circle cx={160} cy={8} r={6} fill="#A100FF"/>
        <text x={174} y={12} fontSize={12} fill="#1f2937">Loan</text>
      </g>

      {/* Y axis */}
      {[0,100,200,300,400,500,600].map((t,i)=>{
        const y = scaleY(t);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={w-10} y2={y} stroke="#E6EAF1" strokeWidth={1} strokeDasharray="4 4" />
            <text x={10} y={y+4} fontSize={11} fill="#94A3B8">{t}k</text>
          </g>
        )
      })}

      {/* Bars (stacked: Net -> Loan -> Tax) */}
      {months.map((m, i) => {
        const bw = 16;
        const groupCenterX = padL + i * barSpace + barSpace / 2;
        const x = groupCenterX - bw / 2;
        const baseBottom = 10 + chartH;

        const hNet = toHeight(netK[i] ?? 0);
        const hLoan = toHeight(loanK[i] ?? 0);
        const hTax = toHeight(taxK[i] ?? 0);
        const joinOverlap = 0.5; // avoid anti-alias seams

        const yNet = baseBottom - hNet;
        const yLoan = yNet - hLoan + joinOverlap;
        const yTax = yLoan - hTax + joinOverlap;

        const topRadiusFor = (seg: 'net' | 'loan' | 'tax') => {
          if (hTax > 0) return seg === 'tax' ? 6 : 0;
          if (hLoan > 0) return seg === 'loan' ? 6 : 0;
          return seg === 'net' ? 6 : 0;
        };

        return (
          <g key={m}>
            {/* Net (bottom) - flat bottom; round if top-only month */}
            <Seg x={x} y={yNet} h={hNet} w={bw} color="#1D75FF" rt={topRadiusFor('net')} rb={0} />
            {/* Loan (middle) - straight edges, round if top */}
            <Seg x={x} y={yLoan} h={hLoan} w={bw} color="#A100FF" rt={topRadiusFor('loan')} rb={0} />
            {/* Tax (top) - round top only */}
            <Seg x={x} y={yTax} h={hTax} w={bw} color="#FF9F1C" rt={topRadiusFor('tax')} rb={0} />
            <text x={groupCenterX} y={h-6} textAnchor="middle" fontSize={11} fill="#94A3B8">{m}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PayrollContent() {
  const search = useSearchParams();
  const [kpis, setKpis] = useState<{ gross: number; net: number; tax: number; loan: number } | null>(null);
  const [summary, setSummary] = useState<{ months: string[]; net: number[]; tax: number[]; loan: number[] }>({ months: [], net: [], tax: [], loan: [] });
  const [defs, setDefs] = useState<{ id: string; title: string; level: string; basicSalary: number; allowance: number; grossSalary: number; deductions: number; netSalary: number }[]>([]);
  const [taxDefs, setTaxDefs] = useState<{ id: string; taxType: string; percent: number }[]>([]);
  const [ps, setPs] = useState<PayslipListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'salary'|'tax'|'payslips'|'payroll'>(() => {
    const t = search?.get('tab');
    if (t === 'tax' || t === 'payslips' || t === 'payroll') return t;
    return 'salary';
  });
  const [delModal, setDelModal] = useState<{ open: boolean; type?: 'salary'|'tax'|'payslip'; id?: string; phase?: 'confirm'|'done'; err?: string }>({ open: false });

  useEffect(() => {
    const u1 = payrollKpis.subscribe((snap) => { if (snap.data) setKpis(snap.data); });
    const u2 = payrollSummary.subscribe((snap) => {
      if (snap.data) {
        const months = snap.data.months;
        const netK = snap.data.series.map((s) => Math.round((s.net || 0) / 1000));
        const taxK = snap.data.series.map((s) => Math.round((s.tax || 0) / 1000));
        const loanK = snap.data.series.map((s) => Math.round((s.loan || 0) / 1000));
        setSummary({ months, net: netK, tax: taxK, loan: loanK });
      }
    });
    const u3 = salaryDefinitions.subscribe((snap) => { if (snap.data) setDefs(snap.data.items); });
    const u4 = taxDefinitions.subscribe((snap) => { if (snap.data) setTaxDefs(snap.data.items); });
    const u5 = payslips.subscribe((snap) => { if (snap.data) setPs(snap.data.items); });
    payrollKpis.refresh().catch(() => void 0);
    payrollSummary.refresh().catch(() => void 0);
    salaryDefinitions.refresh().catch(() => void 0);
    taxDefinitions.refresh().catch(() => void 0);
    payslips.refresh().catch(() => void 0);
    return () => { u1(); u2(); u3(); u4(); u5(); };
  }, []);

  const fmtUSD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const monthOf = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', { month: 'long' });
  };
  const yearOf = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return String(d.getFullYear());
  };
  async function confirmDelete() {
    if (!delModal.open || !delModal.id || !delModal.type) return;
    try {
      if (delModal.type === 'salary') {
        await api(`/payroll/definitions/${delModal.id}`, { method: 'DELETE' });
        await Promise.all([salaryDefinitions.refresh(), payrollKpis.refresh()]);
      } else if (delModal.type === 'tax') {
        await api(`/payroll/taxes/${delModal.id}`, { method: 'DELETE' });
        await taxDefinitions.refresh();
      } else if (delModal.type === 'payslip') {
        await api(`/payroll/payslips/${delModal.id}`, { method: 'DELETE' });
        await payslips.refresh();
      }
      setDelModal((s) => ({ ...s, phase: 'done' }));
    } catch (e: any) {
      setDelModal((s) => ({ ...s, err: e?.message || 'Failed to delete' }));
    }
  }

  // Simple direct-delete helper (since we don't render a modal)
  async function onDelete(type: 'salary'|'tax'|'payslip', id: string) {
    const ok = typeof window !== 'undefined' ? window.confirm('Are you sure you want to delete this item?') : true;
    if (!ok) return;
    try {
      if (type === 'salary') {
        await api(`/payroll/definitions/${id}`, { method: 'DELETE' });
        await Promise.all([salaryDefinitions.refresh(), payrollKpis.refresh()]);
      } else if (type === 'tax') {
        await api(`/payroll/taxes/${id}`, { method: 'DELETE' });
        await taxDefinitions.refresh();
      } else if (type === 'payslip') {
        await api(`/payroll/payslips/${id}`, { method: 'DELETE' });
        await payslips.refresh();
      }
    } catch (e) {
      if (typeof window !== 'undefined') alert('Delete failed');
    }
  }
  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Payroll" subtitle="Generate and send payroll to account." />
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          {/* Top KPI + Chart layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:col-span-2">
              <KpiCard value={kpis ? fmtUSD(kpis.gross) : '—'} label="Gross salary this month" trend={{ up: true, text: '' }} icon={<KpiIcon colorFrom="#1D75FF" colorTo="#5B6EF5"><svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1D75FF]" fill="currentColor"><path d="M12 1l3 5-3 2-3-2 3-5zm8 9h-6l-2 3 2 3h6l2-3-2-3zM4 10H2l2 3-2 3h2l2-3-2-3zm8 4l-3 2 3 5 3-5-3-2z"/></svg></KpiIcon>} />
              <KpiCard value={kpis ? fmtUSD(kpis.net) : '—'} label="Net salary this month" trend={{ up: true, text: '' }} icon={<KpiIcon colorFrom="#1D75FF" colorTo="#5B6EF5"><svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1D75FF]" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v2h2v2h-2v2h-2v-2H9V9h2V7h2z"/></svg></KpiIcon>} />
              <KpiCard value={kpis ? fmtUSD(kpis.tax) : '—'} label="Total tax this month" trend={{ up: false, text: '' }} icon={<KpiIcon colorFrom="#FF9F1C" colorTo="#FFB84D"><svg viewBox="0 0 24 24" className="h-6 w-6 text-[#FF9F1C]" fill="currentColor"><path d="M3 3h18v6H3V3zm0 8h18v10H3V11zm5 2v2h8v-2H8z"/></svg></KpiIcon>} />
              <KpiCard value={kpis ? fmtUSD(kpis.loan) : '—'} label="Total loan this month" trend={{ up: false, text: '' }} icon={<KpiIcon colorFrom="#8A2EFF" colorTo="#C17CFF"><svg viewBox="0 0 24 24" className="h-6 w-6 text-[#8A2EFF]" fill="currentColor"><path d="M12 4l8 4v4c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V8l8-4z"/></svg></KpiIcon>} />
            </div>
            <Card className="p-5 lg:col-span-1">
              <div className="overflow-x-auto -mx-2 px-2">
                <PayrollBarChart months={summary.months} netK={summary.net} taxK={summary.tax} loanK={summary.loan} />
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="p-0">
            <div className="px-5 pt-4">
              <div className="flex items-center gap-6 text-sm">
                <button onClick={() => setActiveTab('salary')} className={(activeTab==='salary'?'text-blue-600 font-medium relative after:content-[""] after:absolute after:left-0 after:-bottom-4 after:h-0.5 after:w-full after:bg-blue-600':'text-gray-500 hover:text-gray-700')+" relative"}>Salary Breakdown</button>
                <button onClick={() => setActiveTab('tax')} className={(activeTab==='tax'?'text-blue-600 font-medium relative after:content-[""] after:absolute after:left-0 after:-bottom-4 after:h-0.5 after:w-full after:bg-blue-600':'text-gray-500 hover:text-gray-700')+" relative"}>Tax Definitions</button>
                <button onClick={() => setActiveTab('payslips')} className={(activeTab==='payslips'?'text-blue-600 font-medium relative after:content-[""] after:absolute after:left-0 after:-bottom-4 after:h-0.5 after:w-full after:bg-blue-600':'text-gray-500 hover:text-gray-700')+" relative"}>Payslips</button>
                <button onClick={() => setActiveTab('payroll')} className={(activeTab==='payroll'?'text-blue-600 font-medium relative after:content-[""] after:absolute after:left-0 after:-bottom-4 after:h-0.5 after:w-full after:bg-blue-600':'text-gray-500 hover:text-gray-700')+" relative"}>Payroll</button>
              </div>
            </div>
            {activeTab==='salary' && (
            <div className="px-5 pb-4 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Salary Defination</h3>
                <Link href="/payroll/create" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Create Salary Definition</Link>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-y bg-gray-50">
                      <th className="px-5 py-3 font-medium">S/N</th>
                      <th className="px-5 py-3 font-medium">Title</th>
                      <th className="px-5 py-3 font-medium">Level</th>
                      <th className="px-5 py-3 font-medium">Basic Salary</th>
                      <th className="px-5 py-3 font-medium">Allowance</th>
                      <th className="px-5 py-3 font-medium">Gross Salary</th>
                      <th className="px-5 py-3 font-medium">Deductions</th>
                      <th className="px-5 py-3 font-medium">Net Salary</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defs.map((r, idx) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-4">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4 text-gray-900">{r.title}</td>
                        <td className="px-5 py-4">{r.level}</td>
                        <td className="px-5 py-4">{fmtUSD(Number(r.basicSalary || 0))}</td>
                        <td className="px-5 py-4">{fmtUSD(Number(r.allowance || 0))}</td>
                        <td className="px-5 py-4">{fmtUSD(Number(r.grossSalary || 0))}</td>
                        <td className="px-5 py-4">{fmtUSD(Number(r.deductions || 0))}</td>
                        <td className="px-5 py-4">{fmtUSD(Number(r.netSalary || 0))}</td>
                        <td className="px-5 py-4 text-blue-600">
                          <Link href={`/payroll/edit/${r.id}`} className="mr-3 hover:underline">Edit</Link>
                          <button onClick={() => onDelete('salary', r.id)} className="text-rose-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>)}
            {activeTab==='payroll' && (
            <div className="px-5 pb-6 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Employee Payroll History</h3>
                <Link href="/payroll/generate" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Generate Payroll</Link>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-y bg-gray-50">
                      <th className="px-5 py-3 font-medium">S/N</th>
                      <th className="px-5 py-3 font-medium">Payment name</th>
                      <th className="px-5 py-3 font-medium">Designation</th>
                      <th className="px-5 py-3 font-medium">Date generated</th>
                      <th className="px-5 py-3 font-medium">Payment month</th>
                      <th className="px-5 py-3 font-medium">Payment year</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => { const rows = ps.filter((r) => !!r.paymentName); return rows.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-sm text-gray-500" colSpan={10}>No payroll records yet.</td>
                      </tr>
                    ) : (
                      rows.map((r, i) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="px-5 py-4">{String(i+1).padStart(2,'0')}</td>
                          <td className="px-5 py-4 text-gray-900">{r.paymentName || 'Monthly salary'}</td>
                          <td className="px-5 py-4">{r.title || '—'}</td>
                          <td className="px-5 py-4">{fmtDate(r.createdAt)}</td>
                          <td className="px-5 py-4">{r.payMonth || monthOf(r.createdAt)}</td>
                          <td className="px-5 py-4">{r.payYear || yearOf(r.createdAt)}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-2 text-emerald-600">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4z"/></svg>
                              Paid
                            </span>
                          </td>
                          <td className="px-5 py-4 text-blue-600"><Link href={`/payroll/payslips/${r.id}`} className="hover:underline">View more</Link></td>
                        </tr>
                      ))
                    ); })()}
                  </tbody>
                </table>
              </div>
            </div>)}
            {activeTab==='payslips' && (
            <div className="px-5 pb-6 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Employee Payslip History</h3>
                <Link href="/payroll/payslips/create" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Create payslip</Link>
              </div>
              <div className="mt-4 overflow-x-auto">
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
                    {ps.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-sm text-gray-500" colSpan={10}>No payslips yet. Create a payslip to get started.</td>
                      </tr>
                    ) : (
                      ps.map((r, i) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="px-5 py-4">{String(i+1).padStart(2,'0')}</td>
                          <td className="px-5 py-4 text-gray-900">{r.staffName}</td>
                          <td className="px-5 py-4">{r.title}</td>
                          <td className="px-5 py-4">{r.level}</td>
                          <td className="px-5 py-4">{fmtUSD(r.basicSalary)}</td>
                          <td className="px-5 py-4">{fmtUSD(r.allowances)}</td>
                          <td className="px-5 py-4">{fmtUSD(r.grossSalary)}</td>
                          <td className="px-5 py-4">{fmtUSD(r.deduction)}</td>
                          <td className="px-5 py-4">{fmtUSD(r.netSalary)}</td>
                          <td className="px-5 py-4 text-blue-600">
                            <Link href={`/payroll/payslips/edit/${r.id}`} className="mr-3 hover:underline">Edit</Link>
                            <button onClick={() => onDelete('payslip', r.id)} className="text-rose-600 hover:underline">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>)}

            {activeTab==='tax' && (
            <div className="px-5 pb-4 mt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Tax Definitions</h3>
                <Link href="/payroll/tax/create" className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Create Tax Definition</Link>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-y bg-gray-50">
                      <th className="px-5 py-3 font-medium">S/N</th>
                      <th className="px-5 py-3 font-medium">Tax Type</th>
                      <th className="px-5 py-3 font-medium">% value</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxDefs.map((r, idx) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-4">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4 text-gray-900">{r.taxType}</td>
                        <td className="px-5 py-4">{r.percent}%</td>
                        <td className="px-5 py-4 text-blue-600">
                          <Link href={`/payroll/tax/edit/${r.id}`} className="mr-3 hover:underline">Edit</Link>
                          <button onClick={() => onDelete('tax', r.id)} className="text-rose-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>)}
          </Card>

          
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  return (
    <Suspense fallback={
      <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <PayrollContent />
    </Suspense>
  );
}
