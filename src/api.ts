export type User = { id: string; username: string; full_name: string; role: 'owner' | 'admin' | 'staff' };
export type FarmData = {
  cows?: Array<Record<string, unknown>>;
  sheep?: Array<Record<string, unknown>>;
  milkRecords?: Array<Record<string, unknown>>;
  transactions?: Array<Record<string, unknown>>;
  staff?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

const TOKEN_KEY = 'avexi_token';
const USER_KEY = 'avexi_user';

export function savedSession(): { token: string; user: User } | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const rawUser = sessionStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  try { return { token, user: JSON.parse(rawUser) as User }; } catch { sessionStorage.clear(); return null; }
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

async function request<T>(url: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('x-avexi-token', token);
  const response = await fetch(url, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Request failed');
  return body as T;
}

export async function login(username: string, password: string) {
  const result = await request<User & { status: string; token: string }>('/api/auth', {
    method: 'POST', body: JSON.stringify({ action: 'login', username, password }),
  });
  if (result.status !== 'ok') throw new Error(result.status === 'blocked' ? 'This account is blocked.' : 'Invalid username or password.');
  const user = { id: result.id, username: result.username, full_name: result.full_name, role: result.role };
  sessionStorage.setItem(TOKEN_KEY, result.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token: result.token, user };
}

export async function getFarmData(token: string) {
  return request<{ data: FarmData | null; updated_at: string | null }>('/api/db', {}, token);
}

export async function saveFarmData(token: string, data: FarmData) {
  return request<{ ok: boolean; updated_at: string }>('/api/db', {
    method: 'POST', body: JSON.stringify({ data }),
  }, token);
}
