import Card from '../dashboard/Card';
import Link from 'next/link';
import { API_ORIGIN } from '../../utils/api';

type Row = {
  id: string;
  sn: string;
  first: string;
  last: string;
  gender: string;
  staffId: string;
  phone: string;
  role: string;
  designation: string;
  photoUrl?: string;
};

export default function StaffTable({ rows, total, page, limit, onPrev, onNext }: { rows: Row[]; total: number; page: number; limit: number; onPrev: () => void; onNext: () => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">All Staff</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Showing</span>
          <span className="inline-flex items-center justify-center h-8 px-2 rounded-lg border border-gray-200 bg-white text-gray-700">{limit}</span>
          <span>per page</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-[420px] overflow-y-scroll thin-scroll scroll-area has-rail pr-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-gray-500 shadow-[0_1px_0_#EFF2F7]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">S/N</th>
                <th className="text-left px-4 py-3 font-medium">Photo</th>
                <th className="text-left px-4 py-3 font-medium">First Name</th>
                <th className="text-left px-4 py-3 font-medium">Last Name</th>
                <th className="text-left px-4 py-3 font-medium">Gender</th>
                <th className="text-left px-4 py-3 font-medium">Staff ID</th>
                <th className="text-left px-4 py-3 font-medium">Phone Number</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Designation</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-400 text-center" colSpan={10}>No staff found.</td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.sn + '-' + i} className="text-gray-700">
                  <td className="px-4 py-4">{r.sn}</td>
                  <td className="px-4 py-4">
                    {r.photoUrl ? (
                      <img
                        src={r.photoUrl.startsWith('http') ? r.photoUrl : `${API_ORIGIN}${r.photoUrl.startsWith('/') ? '' : '/'}${r.photoUrl}`}
                        alt="staff"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center text-xs text-gray-500">
                        {r.first?.[0]}{r.last?.[0]}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">{r.first}</td>
                  <td className="px-4 py-4">{r.last}</td>
                  <td className="px-4 py-4">{r.gender}</td>
                  <td className="px-4 py-4">{r.staffId}</td>
                  <td className="px-4 py-4">{r.phone}</td>
                  <td className="px-4 py-4">{r.role}</td>
                  <td className="px-4 py-4">{r.designation}</td>
                  <td className="px-4 py-4 text-blue-600">
                    <Link href={`/staff/${encodeURIComponent(r.id)}`} className="hover:underline">
                      View more
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-2 justify-end">
        <button onClick={onPrev} className="h-9 px-3 rounded-lg border bg-white border-gray-200 text-sm disabled:opacity-50" disabled={page <= 1}>Prev</button>
        <div className="text-sm text-gray-500">Page {page}</div>
        <button onClick={onNext} className="h-9 px-3 rounded-lg border bg-white border-gray-200 text-sm">Next</button>
      </div>
    </Card>
  );
}
