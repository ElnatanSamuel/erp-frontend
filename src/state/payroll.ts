import { resource } from '@elnatan/better-state';
import { api } from '../utils/api';

export type PayrollKPIs = {
  gross: number;
  net: number;
  tax: number;
  loan: number;
};

export type PayrollSummary = {
  months: string[]; // Jan..Dec
  series: Array<{ gross: number; net: number; tax: number; loan: number }>;
};

export type SalaryDefinition = {
  id: string;
  title: string;
  level: string;
  basicSalary: number;
  allowance: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
};

export type SalaryDefinitionsResponse = {
  items: SalaryDefinition[];
  total: number;
  page: number;
  limit: number;
};

export const payrollKpis = resource<PayrollKPIs>(async () => {
  return api<PayrollKPIs>('/payroll/kpis');
});

export const payrollSummary = resource<PayrollSummary>(async () => {
  return api<PayrollSummary>('/payroll/summary');
});

export const salaryDefinitions = resource<SalaryDefinitionsResponse>(async () => {
  return api<SalaryDefinitionsResponse>('/payroll/definitions');
});

export type TaxDefinition = {
  id: string;
  taxType: string;
  percent: number; // e.g., 2 for 2%
};

export type TaxDefinitionsResponse = {
  items: TaxDefinition[];
  total: number;
  page: number;
  limit: number;
};

export const taxDefinitions = resource<TaxDefinitionsResponse>(async () => {
  return api<TaxDefinitionsResponse>('/payroll/taxes');
});

export type PayslipListItem = {
  id: string;
  staffName: string;
  title: string;
  level: string;
  paymentName?: string;
  payMonth?: string;
  payYear?: string;
  basicSalary: number;
  allowances: number;
  grossSalary: number;
  deduction: number;
  netSalary: number;
  createdAt?: string;
};

export type PayslipsResponse = {
  items: PayslipListItem[];
  total: number;
  page: number;
  limit: number;
};

export const payslips = resource<PayslipsResponse>(async () => {
  return api<PayslipsResponse>('/payroll/payslips');
});
