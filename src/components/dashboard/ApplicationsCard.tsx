import Card from './Card';

export default function ApplicationsCard({ approved = 0, pending = 0, rejected = 0 }: { approved?: number; pending?: number; rejected?: number }) {
  const total = approved + pending + rejected;
  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const rejectedPct = total > 0 ? 100 - approvedPct - pendingPct : 0;

  const gradient = total > 0
    ? `conic-gradient(#10b981 0 ${approvedPct}%, #f59e0b ${approvedPct}% ${approvedPct + pendingPct}%, #ef4444 ${approvedPct + pendingPct}% 100%)`
    : 'conic-gradient(#e5e7eb 0 100%)';

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Applications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            {total} Total applications{total === 0 ? ' — no data yet' : ''}
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span><span className="font-medium">{pending}</span> Pending</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span><span className="font-medium">{approved}</span> Approved</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-rose-500"></span>
              <span><span className="font-medium">{rejected}</span> Rejected</span>
            </li>
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-full" style={{ backgroundImage: gradient }} />
            <div className="absolute inset-4 rounded-full bg-white grid place-items-center">
              <div className="text-center">
                <div className="text-sm text-gray-500">Approved</div>
                <div className="text-xl font-semibold text-gray-900">{approvedPct}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
