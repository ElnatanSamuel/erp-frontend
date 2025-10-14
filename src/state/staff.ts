import { fromPromise } from '@elnatan/better-state/async';
import { api } from '../utils/api';

export type StaffItem = { id: string; name: string; email: string };
export type StaffListResult = { items: StaffItem[]; total: number; page: number; limit: number };

export function listStaff(q: string, page: number, limit: number, role?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (role && role !== 'All') params.set('role', role);
  return fromPromise(api<StaffListResult>(`/users?${params.toString()}`));
}
