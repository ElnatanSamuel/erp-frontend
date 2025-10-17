import Card from './Card';

function Stat({ value, label, icon, trend }: { value: string; label: string; icon: React.ReactNode; trend?: { up?: boolean; text: string } }) {
  return (
    <Card className="p-5 flex items-start gap-4">
      <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-3xl font-semibold text-gray-900 leading-none">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
        {trend && (
          <div className={`mt-2 text-xs ${trend.up ? 'text-green-600' : 'text-rose-600'}`}>
            {trend.up ? '↑ ' : '↓ '}
            {trend.text}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function StatsGrid({ totals }: { totals?: { staffCount: number; applicationCount: number; projectsCount: number; departmentsCount: number; trendStaff?: string; trendApplications?: string; trendProjects?: string } }) {
  const t = totals;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <Stat
        value={String(t?.staffCount ?? 0)}
        label="Total number of staff"
        icon={<UsersIcon />}
        trend={t?.trendStaff ? { up: true, text: t.trendStaff } : undefined}
      />
      <Stat
        value={String(t?.applicationCount ?? 0)}
        label="Total application"
        icon={<AppIcon />}
        trend={t?.trendApplications ? { up: false, text: t.trendApplications } : undefined}
      />
      <Stat value={String(t?.projectsCount ?? 0)} label="Total projects" icon={<ProjectsIcon />} trend={t?.trendProjects ? { up: true, text: t.trendProjects } : undefined} />
      <Stat value={String(t?.departmentsCount ?? 0)} label="Total designations" icon={<DeptIcon />} />
    </div>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}
function AppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M4 4h16v16H4z" opacity=".2"/><path d="M20 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2zM8 8h3v3H8V8zm0 5h3v3H8v-3zm5-5h3v3h-3V8zm0 5h3v3h-3v-3z"/>
    </svg>
  );
}
function ProjectsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M3 3h18v4H3V3zm0 6h10v12H3V9zm12 0h6v12h-6V9z"/>
    </svg>
  );
}
function DeptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M3 21h18v-2H3v2zM3 3v14h8V3H3zm10 6v8h8V9h-8z"/>
    </svg>
  );
}
