import { requireToken, setCors } from './_auth.js';

const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const user = requireToken(req, res);
  if (!user) return;
  if (!SUPA_URL || !SUPA_KEY) return res.status(500).json({ error: 'Database service is not configured' });
  try {
    if (req.method === 'POST') {
      const body = req.body || {};
      const response = await fetch(`${SUPA_URL}/rest/v1/login_logs`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }, body: JSON.stringify({ ...body, user_id: user.id }) });
      if (!response.ok) return res.status(502).json({ error: 'Could not record login log' });
      return res.status(201).json({ ok: true });
    }
    if (req.method === 'GET') {
      if (!['owner', 'admin'].includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
      const date = typeof req.query?.date === 'string' ? req.query.date.replace(/[^0-9-]/g, '') : '';
      const suffix = date ? `&logged_in_at=gte.${date}T00:00:00&logged_in_at=lt.${date}T23:59:59` : '';
      const response = await fetch(`${SUPA_URL}/rest/v1/login_logs?order=logged_in_at.desc&limit=100${suffix}`, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } });
      if (!response.ok) return res.status(502).json({ error: 'Could not read login logs' });
      return res.status(200).json(await response.json());
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('logs request failed', error);
    return res.status(500).json({ error: 'Logs request failed' });
  }
}
