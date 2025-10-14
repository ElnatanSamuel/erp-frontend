import { serverResource } from '../../utils/serverResources';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const r = serverResource('health', async () => {
    const res = await fetch(`${url}/health`, { cache: 'no-store' });
    return res.json();
  });
  // Note: serverResource returns a Resource; on server we can read snapshot directly
  const data = { data: r.data, loading: r.loading, error: r.error?.message };
  return (
    <pre className="text-sm">
      {JSON.stringify({ url: `${url}/health`, ...data }, null, 2)}
    </pre>
  );
}
