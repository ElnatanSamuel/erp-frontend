export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const API_ORIGIN = API_URL.replace(/\/?api\/?$/, '');

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_URL}/api${path}`, {
    headers,
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiMultipart<T>(path: string, form: FormData): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_URL}/api${path}`, {
    method: 'POST',
    headers, // do not set Content-Type for FormData
    body: form,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}
