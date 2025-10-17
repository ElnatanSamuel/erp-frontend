'use client';

import Sidebar from '../../../components/dashboard/Sidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import Card from '../../../components/dashboard/Card';
import Link from 'next/link';
import { useState } from 'react';
import { Input } from '../../../components/ui/input';
import { api } from '../../../utils/api';

type VoucherItem = {
  sn: string;
  class: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  vatPercent: number;
  vatAmount: number;
  grossAmount: number;
  whtPercent: number;
  whtAmount: number;
  netAmount: number;
};

export default function CreatePaymentVoucherPage() {
  const [subject, setSubject] = useState('');
  const [items, setItems] = useState<VoucherItem[]>([
    {
      sn: '01',
      class: '',
      description: '',
      qty: 1,
      unitPrice: 0,
      amount: 0,
      vatPercent: 7.5,
      vatAmount: 0,
      grossAmount: 0,
      whtPercent: 0,
      whtAmount: 0,
      netAmount: 0,
    },
  ]);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fmtAmt = (n: number) =>
    Number.isFinite(n)
      ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';

  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    const convertHundreds = (n: number): string => {
      let str = '';
      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 10 && n < 20) {
        str += teens[n - 10] + ' ';
      } else {
        if (n >= 20) {
          str += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        }
        if (n > 0) {
          str += ones[n] + ' ';
        }
      }
      return str.trim();
    };

    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);

    let result = '';
    let groupIndex = 0;
    let tempNum = intPart;

    while (tempNum > 0) {
      const group = tempNum % 1000;
      if (group !== 0) {
        const groupWords = convertHundreds(group);
        result = groupWords + (thousands[groupIndex] ? ' ' + thousands[groupIndex] : '') + ' ' + result;
      }
      tempNum = Math.floor(tempNum / 1000);
      groupIndex++;
    }

    result = result.trim() + ' Dollars';

    if (decPart > 0) {
      result += ' and ' + convertHundreds(decPart) + ' cents';
    }

    return result.trim();
  };

  const calculateTotals = () => {
    const totalUnitPrice = items.reduce((sum, item) => sum + item.unitPrice, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalVatAmount = items.reduce((sum, item) => sum + item.vatAmount, 0);
    const totalWhtAmount = items.reduce((sum, item) => sum + item.whtAmount, 0);
    const totalNetAmount = items.reduce((sum, item) => sum + item.netAmount, 0);
    return { totalUnitPrice, totalAmount, totalVatAmount, totalWhtAmount, totalNetAmount };
  };

  const totals = calculateTotals();
  const netAmountInWords = numberToWords(totals.totalNetAmount);

  const updateItem = (index: number, field: keyof VoucherItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate amounts
    const item = newItems[index];
    item.amount = item.qty * item.unitPrice;
    item.vatAmount = item.amount * (item.vatPercent / 100);
    item.grossAmount = item.amount + item.vatAmount;
    item.whtAmount = item.amount * (item.whtPercent / 100);
    item.netAmount = item.grossAmount - item.whtAmount;

    setItems(newItems);
  };

  const addRow = () => {
    const nextSn = String(items.length + 1).padStart(2, '0');
    setItems([
      ...items,
      {
        sn: nextSn,
        class: '',
        description: '',
        qty: 1,
        unitPrice: 0,
        amount: 0,
        vatPercent: 7.5,
        vatAmount: 0,
        grossAmount: 0,
        whtPercent: 0,
        whtAmount: 0,
        netAmount: 0,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  async function onSubmit() {
    setError(null);
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    setSubmitting(true);
    try {
      await api<{ id: string }>('/payment-voucher', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          items,
          totalUnitPrice: totals.totalUnitPrice,
          totalAmount: totals.totalAmount,
          totalVatAmount: totals.totalVatAmount,
          totalWhtAmount: totals.totalWhtAmount,
          totalNetAmount: totals.totalNetAmount,
          netAmountInWords,
          accountName,
          accountNumber,
          bankName,
          status: 'Pending',
        }),
      });
      setModalOpen(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to create payment voucher');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F6F8FB] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 pt-6 pb-4 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-100">
          <DashboardHeader title="Payment Voucher" subtitle="Create account for a new staff" />
          <div className="mt-4">
            <Link
              href="/payment-voucher"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-10 py-6 space-y-6 overflow-y-auto">
          <Card className="p-6 lg:p-7">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Voucher</h3>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Subject</label>
              <Input
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-3 py-2 text-left font-medium">S/N</th>
                    <th className="border px-3 py-2 text-left font-medium">Class</th>
                    <th className="border px-3 py-2 text-left font-medium">Description</th>
                    <th className="border px-3 py-2 text-left font-medium">QTY</th>
                    <th className="border px-3 py-2 text-left font-medium">Unit Price ($)</th>
                    <th className="border px-3 py-2 text-left font-medium">Amount ($)</th>
                    <th className="border px-3 py-2 text-left font-medium">VAT %</th>
                    <th className="border px-3 py-2 text-left font-medium">VAT Amount ($)</th>
                    <th className="border px-3 py-2 text-left font-medium">Gross Amount ($)</th>
                    <th className="border px-3 py-2 text-left font-medium">WHT%</th>
                    <th className="border px-3 py-2 text-left font-medium">WHT Amount</th>
                    <th className="border px-3 py-2 text-left font-medium">Net Amount</th>
                    <th className="border px-3 py-2 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-3 py-2">{item.sn}</td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={item.class}
                          onChange={(e) => updateItem(idx, 'class', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="1"
                        />
                      </td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-32 px-2 py-1 border rounded text-sm"
                          min="0"
                        />
                      </td>
                      <td className="border px-3 py-2 text-right">{fmtAmt(item.amount)}</td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          value={item.vatPercent}
                          onChange={(e) => updateItem(idx, 'vatPercent', Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="border px-3 py-2 text-right">{fmtAmt(item.vatAmount)}</td>
                      <td className="border px-3 py-2 text-right">{fmtAmt(item.grossAmount)}</td>
                      <td className="border px-3 py-2">
                        <input
                          type="number"
                          value={item.whtPercent}
                          onChange={(e) => updateItem(idx, 'whtPercent', Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="border px-3 py-2 text-right">{fmtAmt(item.whtAmount)}</td>
                      <td className="border px-3 py-2 text-right">{fmtAmt(item.netAmount)}</td>
                      <td className="border px-3 py-2 text-center">
                        <button
                          onClick={() => removeRow(idx)}
                          className="text-red-600 hover:text-red-700 text-xs"
                          disabled={items.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={4} className="border px-3 py-2 text-right">
                      Total
                    </td>
                    <td className="border px-3 py-2 text-right">{fmtAmt(totals.totalUnitPrice)}</td>
                    <td className="border px-3 py-2 text-right">{fmtAmt(totals.totalAmount)}</td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2 text-right">{fmtAmt(totals.totalVatAmount)}</td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2"></td>
                    <td className="border px-3 py-2 text-right">{fmtAmt(totals.totalWhtAmount)}</td>
                    <td className="border px-3 py-2 text-right">{fmtAmt(totals.totalNetAmount)}</td>
                    <td className="border px-3 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-6"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Add another row
            </button>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Net amount in words:</label>
              <div className="min-h-10 py-2 border-b border-gray-300 text-gray-900">
                {netAmountInWords || '—'}
              </div>
            </div>

            {/* Beneficiary Payment Details */}
            <div className="mt-8">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Beneficiary Payment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Account name</label>
                  <Input
                    placeholder="Enter name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Account number</label>
                  <Input
                    placeholder="Enter number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Bank name</label>
                  <Input
                    placeholder="Enter bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center h-11 px-8 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Payment Voucher'}
              </button>
              {error && <span className="text-sm text-rose-600">{error}</span>}
            </div>
          </Card>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-[320px] p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 grid place-items-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Congratulations</div>
            <div className="text-sm text-gray-600 mb-5">
              Your payment voucher has been submitted successfully.
            </div>
            <button
              onClick={() => {
                setModalOpen(false);
                window.location.href = '/payment-voucher';
              }}
              className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-white bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
