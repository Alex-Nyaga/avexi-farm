// api/logs.js — Vercel Serverless Function
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

  try {
    if (req.method === 'POST') {
      await fetch(`${SUPA_URL}/rest/v1/login_logs`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(req.body)
      });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const token = req.headers['x-avexi-token'];
      if (!token || !verifyToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const date = req.query?.date;
      let url = `${SUPA_URL}/rest/v1/login_logs?order=logged_in_at.desc&limit=100`;
      if (date) url += `&date=eq.${date}`;
      const r    = await fetch(url, { headers: HEADERS });
      const data = await r.json();
      return res.status(200).json(data);
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
