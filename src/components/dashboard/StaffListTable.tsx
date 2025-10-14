import Card from './Card';
import { API_ORIGIN } from '../../utils/api';

type Row = { sn: string; name: string; role: string; designation: string; photoUrl?: string };

export default function StaffListTable({ rows }: { rows?: Row[] }) {
  const hasRows = !!rows && rows.length > 0;
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff List</h3>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-72 overflow-y-scroll thin-scroll scroll-area has-rail pr-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-gray-500 shadow-[0_1px_0_#EFF2F7]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">S/N</th>
                <th className="text-left px-4 py-3 font-medium">Photo</th>
                <th className="text-left px-4 py-3 font-medium">Staff Name</th>
                <th className="text-left px-4 py-3 font-medium">Staff Role</th>
                <th className="text-left px-4 py-3 font-medium">Designation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!hasRows && (
                <tr>
                  <td className="px-4 py-6 text-gray-400 text-center" colSpan={4}>
                    No staff yet.
                  </td>
                </tr>
              )}
              {hasRows && rows!.map((r, i) => (
                <tr key={r.sn + '-' + i} className="text-gray-700">
                  <td className="px-4 py-4">{r.sn}</td>
                  <td className="px-4 py-4">
                    <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-300">
                      {r.photoUrl ? (
                        <img
                          src={r.photoUrl.startsWith('/') ? `${API_ORIGIN}${r.photoUrl}` : r.photoUrl}
                          alt="staff"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[10px] text-gray-500 bg-gray-100">
                          {(r.name?.split(' ')?.map(s => s[0]).join('') || 'S').slice(0,2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">{r.name}</td>
                  <td className="px-4 py-4">{r.role}</td>
                  <td className="px-4 py-4">{r.designation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
