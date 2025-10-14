import Card from './Card';

type Row = { sn: string; subject: string; date: string; status: string };

export default function PaymentsTable({ rows }: { rows?: Row[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Vouchers</h3>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-72 overflow-y-scroll thin-scroll scroll-area has-rail pr-2">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white text-gray-500 shadow-[0_1px_0_#EFF2F7]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">S/N</th>
                <th className="text-left px-4 py-3 font-medium">Subject</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!rows || rows.length === 0) && (
                <tr>
                  <td className="px-4 py-6 text-gray-400 text-center" colSpan={4}>
                    No payment vouchers yet.
                  </td>
                </tr>
              )}
              {rows?.map((r) => (
                <tr key={r.sn} className="text-gray-700">
                  <td className="px-4 py-3">{r.sn}</td>
                  <td className="px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs ' +
                        (r.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700')
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
