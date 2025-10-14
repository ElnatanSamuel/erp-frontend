import Card from './Card';

type Row = { sn: string; title: string; from: string; to: string; status: string };

export default function MemoTable({ rows }: { rows?: Row[] }) {
  const hasRows = !!rows && rows.length > 0;
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Memo</h3>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-72 overflow-y-scroll thin-scroll scroll-area has-rail pr-4">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-gray-500 shadow-[0_1px_0_#EFF2F7]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">S/N</th>
              <th className="text-left px-4 py-3 font-medium">Memo Title</th>
              <th className="text-left px-4 py-3 font-medium">Sent From</th>
              <th className="text-left px-4 py-3 font-medium">Sent To</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!hasRows && (
                <tr>
                  <td className="px-4 py-6 text-gray-400 text-center" colSpan={5}>
                    No memos yet.
                  </td>
                </tr>
              )}
              {hasRows && rows!.map((row, i) => (
                <tr key={row.sn + '-' + i} className="text-gray-700">
                  <td className="px-4 py-4">{row.sn}</td>
                  <td className="px-4 py-4">{row.title}</td>
                  <td className="px-4 py-4">{row.from}</td>
                  <td className="px-4 py-4">{row.to}</td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs ' +
                        (row.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700')
                      }
                    >
                      {row.status}
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
