import { requireToken, setCors } from './_auth.js';

const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;
const headers = () => ({ 'Content-Type': 'application/json', apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` });

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const user = requireToken(req, res);
  if (!user) return;
  if (!SUPA_URL || !SUPA_KEY) return res.status(500).json({ error: 'Database service is not configured' });
  // Each farm only ever reads/writes its own row; the key comes from the signed token, never the client.
  const farmKey = encodeURIComponent(String(user.farmId || 'avexi_main'));
  const isStaff = user.role === 'staff';
  const hiddenFromStaff = ['transactions', 'staffPayments'];
  const readRow = async () => {
    const response = await fetch(`${SUPA_URL}/rest/v1/farm_data?key=eq.${farmKey}&select=data,updated_at&limit=1`, { headers: headers() });
    if (!response.ok) throw new Error('read failed');
    return (await response.json())[0] || null;
  };
  try {
    if (req.method === 'GET') {
      const row = await readRow();
      let data = row?.data || null;
      if (data && isStaff) {
        data = { ...data };
        hiddenFromStaff.forEach((k) => { data[k] = []; });
      }
      return res.status(200).json({ data, updated_at: row?.updated_at || null });
    }
    if (req.method === 'POST') {
      let data = req.body?.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'Farm data must be an object' });
      if (JSON.stringify(data).length > 4_000_000) return res.status(413).json({ error: 'Farm data is too large' });
      if (isStaff) {
        // Workers may only change milk records; everything else (incl. finances) is kept as stored.
        const existing = (await readRow())?.data;
        if (!existing) return res.status(403).json({ error: 'Forbidden' });
        data = { ...existing, milkRecords: Array.isArray(data.milkRecords) ? data.milkRecords : existing.milkRecords };
      }
      const updated_at = new Date().toISOString();
      const response = await fetch(`${SUPA_URL}/rest/v1/farm_data`, { method: 'POST', headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ key: decodeURIComponent(farmKey), data, updated_at }) });
      if (!response.ok) return res.status(502).json({ error: 'Could not save farm data' });
      return res.status(200).json({ ok: true, updated_at });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('database request failed', error);
    return res.status(500).json({ error: 'Database request failed' });
  }
}
