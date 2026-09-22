import { requireToken, setCors } from './_auth.js';

const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;
const headers = () => ({ 'Content-Type': 'application/json', apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` });

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!requireToken(req, res)) return;
  if (!SUPA_URL || !SUPA_KEY) return res.status(500).json({ error: 'Database service is not configured' });
  try {
    if (req.method === 'GET') {
      const response = await fetch(`${SUPA_URL}/rest/v1/farm_data?key=eq.avexi_main&select=data,updated_at&limit=1`, { headers: headers() });
      if (!response.ok) return res.status(502).json({ error: 'Could not read farm data' });
      const [row] = await response.json();
      return res.status(200).json({ data: row?.data || null, updated_at: row?.updated_at || null });
    }
    if (req.method === 'POST') {
      const data = req.body?.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'Farm data must be an object' });
      const updated_at = new Date().toISOString();
      const response = await fetch(`${SUPA_URL}/rest/v1/farm_data`, { method: 'POST', headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ key: 'avexi_main', data, updated_at }) });
      if (!response.ok) return res.status(502).json({ error: 'Could not save farm data' });
      return res.status(200).json({ ok: true, updated_at });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('database request failed', error);
    return res.status(500).json({ error: 'Database request failed' });
  }
}
