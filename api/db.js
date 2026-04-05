// api/db.js — Vercel Serverless Function
const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;
const HEADERS  = {
  'Content-Type': 'application/json',
  'apikey': SUPA_KEY,
  'Authorization': 'Bearer ' + SUPA_KEY
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-avexi-token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers['x-avexi-token'];
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const r    = await fetch(`${SUPA_URL}/rest/v1/farm_data?key=eq.avexi_main&select=data,updated_at`, { headers: HEADERS });
      const rows = await r.json();
      const data       = rows?.[0]?.data       || null;
      const updated_at = rows?.[0]?.updated_at || null;
      return res.status(200).json({ data, updated_at });
    }

    if (req.method === 'POST') {
      const { data } = req.body;
      const updated_at = new Date().toISOString();
      const r = await fetch(`${SUPA_URL}/rest/v1/farm_data`, {
        method: 'POST',
        headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key: 'avexi_main', data, updated_at })
      });
      const ok = r.status >= 200 && r.status < 300;
      return res.status(200).json({ ok, updated_at });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function verifyToken(token) {
  try {
    const secret = process.env.AVEXI_SECRET || 'avexi-secret';
    const [payload, sig] = token.split('.');
    const { ts } = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (Date.now() - ts > 86400000) return false;
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return sig === expected;
  } catch { return false; }
}
