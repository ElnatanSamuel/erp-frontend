import { resource } from '@elnatan/better-state';
import { api } from '../utils/api';

export type BudgetEntry = {
  id: string;
  budgetNo: string;
  description: string;
  amountUsd: number;
  date: string;
  receivingOffice?: string | null;
  status: 'draft' | 'submitted';
};

export type BudgetEntriesResponse = {
  items: BudgetEntry[];
  total: number;
  page: number;
  limit: number;
};

export const budgetEntries = resource<BudgetEntriesResponse>(async () => {
  return api<BudgetEntriesResponse>('/budget/entries?status=submitted');
});

export type BudgetKpis = {
  totalAnnualUsd: number;
  usedUsd: number;
  balanceUsd: number;
  percentUsed: number; // 0-100
};

export const budgetKpis = resource<BudgetKpis>(async () => {
  const { items } = await api<BudgetEntriesResponse>('/budget/entries?status=submitted');
  const totalAnnualUsd = 10_000_000; // fixed 10M USD
  const usedUsd = Math.max(0, Math.round(items.reduce((s, x) => s + (Number(x.amountUsd) || 0), 0)));
  const balanceUsd = Math.max(0, totalAnnualUsd - usedUsd);
  const percentUsed = totalAnnualUsd > 0 ? Math.min(100, Math.round((usedUsd / totalAnnualUsd) * 100)) : 0;
  return { totalAnnualUsd, usedUsd, balanceUsd, percentUsed };
});
