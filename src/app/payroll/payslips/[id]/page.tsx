'use client';

import Sidebar from '../../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../../components/dashboard/DashboardHeader';
import Card from '../../../../components/dashboard/Card';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../utils/api';

// Simple English number-to-words for positive integers up to the billions
function numberToWords(nRaw: number): string {
  const n = Math.floor(Math.abs(nRaw));
  if (n === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','Ten','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const scales = ['','Thousand','Million','Billion'];
  function chunkToWords(num: number): string {
    let out: string[] = [];
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    if (hundred) out.push(ones[hundred] + ' Hundred');
    if (rest) {
      if (rest < 20) out.push(ones[rest]);
      else {
        const t = Math.floor(rest / 10);
        const o = rest % 10;
        out.push(tens[t] + (o ? '-' + ones[o] : ''));
      }
    }
    return out.join(' ');
  }
  const parts: string[] = [];
  let num = n;
  let scale = 0;
  while (num > 0 && scale < scales.length) {
    const chunk = num % 1000;
    if (chunk) {
      const words = chunkToWords(chunk);
      parts.unshift(words + (scales[scale] ? ' ' + scales[scale] : ''));
    }
    num = Math.floor(num / 1000);
    scale++;
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

 type Payslip = {
  id: string;
  staffName: string;
  title: string;
  level: string;
  paymentName?: string;
  payMonth?: string;
  payYear?: string;
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
  createdAt?: string;
};

export default function PayslipDetailsPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [data, setData] = useState<Payslip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api<Payslip>(`/payroll/payslips/${id}`);
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        setError(e?.message || 'Failed to load payslip');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const fmtUSD = (n: number) => (Number(n) || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const allowancesTotal = useMemo(() => {
    if (!data) return 0;
    return (
      (data.housingAllowance || 0) +
      (data.transportAllowance || 0) +
      (data.utilityAllowance || 0) +
      (data.productivityAllowance || 0) +
      (data.communicationAllowance || 0) +
      (data.inconvenienceAllowance || 0)
    );
  }, [data]);

  const netWords = useMemo(() => {
    if (!data) return '';
    return numberToWords(Math.round(data.netSalary || 0));
  }, [data]);

  const monthYear = useMemo(() => {
    if (data?.payMonth && data?.payYear) {
      return { month: data.payMonth, year: data.payYear };
    }
    if (!data?.createdAt) return { month: '—', year: '—' };
    const d = new Date(data.createdAt);
    if (isNaN(d.getTime())) return { month: '—', year: '—' };
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = String(d.getFullYear());
    return { month, year };
  }, [data?.payMonth, data?.payYear, data?.createdAt]);

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Payroll" subtitle="Generate and send payroll to account." />
          <div className="mt-4">
            <Link href="/payroll?tab=payslips" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Back
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7 flex items-start justify-between">
            <div>
              <div className="text-xl font-semibold text-gray-900">{data?.staffName || (loading ? 'Loading…' : '—')}</div>
              <div className="text-sm text-gray-500 mt-1">{data ? `${data.title || '—'} | ${data.level || '—'}` : ' '}</div>
              {data?.paymentName && (
                <div className="text-xs text-gray-400 mt-1">Payment: {data.paymentName}</div>
              )}
              {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
            </div>
            {id && (
              <Link href={`/payroll/payslips/edit/${id}`} className="inline-flex items-center justify-center h-10 px-5 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm">Edit payslip</Link>
            )}
          </Card>

          <Card className="p-0">
            <div className="p-5 pb-0">
              <h3 className="text-base font-semibold text-gray-900">Salary Payslip</h3>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-10">
                <span>Month: {monthYear.month}</span>
                <span>Year: {monthYear.year}</span>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Salary Structure */}
                <div className="border rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="px-5 py-3 text-left font-medium">Salary Structure</th>
                        <th className="px-5 py-3 text-left font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="px-5 py-3">Basic Salary</td><td className="px-5 py-3">{fmtUSD(data?.basicSalary || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Housing Allowance</td><td className="px-5 py-3">{fmtUSD(data?.housingAllowance || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Transport Allowance</td><td className="px-5 py-3">{fmtUSD(data?.transportAllowance || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Utility Allowance</td><td className="px-5 py-3">{fmtUSD(data?.utilityAllowance || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Productivity Allowance</td><td className="px-5 py-3">{fmtUSD(data?.productivityAllowance || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Communication Allowance</td><td className="px-5 py-3">{fmtUSD(data?.communicationAllowance || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Inconvenience allowance</td><td className="px-5 py-3">{fmtUSD(data?.inconvenienceAllowance || 0)}</td></tr>
                      <tr className="font-semibold bg-gray-50"><td className="px-5 py-3">Gross Salary</td><td className="px-5 py-3">{fmtUSD(data?.grossSalary || (data ? (data.basicSalary + allowancesTotal) : 0))}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions */}
                <div className="border rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="px-5 py-3 text-left font-medium">Deductions</th>
                        <th className="px-5 py-3 text-left font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="px-5 py-3">Tax/PAYE</td><td className="px-5 py-3">{fmtUSD(data?.taxPayee || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Employee Pension</td><td className="px-5 py-3">{fmtUSD(data?.employeePension || 0)}</td></tr>
                      <tr><td className="px-5 py-3">Total Deduction</td><td className="px-5 py-3">{fmtUSD(data?.totalDeduction || 0)}</td></tr>
                      <tr className="font-semibold">
                        <td className="px-5 py-3">Net Salary</td>
                        <td className="px-5 py-3">{fmtUSD(data?.netSalary || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 text-sm text-gray-700">
                <span className="font-medium">Net Salary in Words:</span>
                <span className="ml-2">{netWords ? `${netWords} Only` : '—'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
