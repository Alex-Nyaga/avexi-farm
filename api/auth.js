// api/auth.js — Vercel Serverless Function
const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, username, password, userId } = req.body;

    const HEADERS = {
      'Content-Type': 'application/json',
      'apikey': SUPA_KEY,
      'Authorization': 'Bearer ' + SUPA_KEY
    };

    if (action === 'login') {
      const r    = await fetch(`${SUPA_URL}/rest/v1/app_users?select=*`, { headers: HEADERS });
      const rows = await r.json();

      if (!Array.isArray(rows)) {
        return res.status(500).json({ error: 'Could not reach database. Check environment variables.' });
      }

      const u = rows.find(row => row.username.toLowerCase() === username.toLowerCase());

      if (!u)        return res.status(200).json({ status: 'wrong', attempts_left: 2 });
      if (u.blocked) return res.status(200).json({ status: 'blocked' });
      if (u.pw_hash !== password) return res.status(200).json({ status: 'wrong', attempts_left: 2 });

      const token = generateToken({ id: u.id, username: u.username, role: u.role });
      return res.status(200).json({ status: 'ok', id: u.id, username: u.username, full_name: u.full_name, role: u.role, token });
    }

    if (action === 'verify') {
      const r    = await fetch(`${SUPA_URL}/rest/v1/app_users?select=*`, { headers: HEADERS });
      const rows = await r.json();

      if (!Array.isArray(rows)) return res.status(200).json({ status: 'not_found' });

      const u = rows.find(row => row.id === userId);

      if (!u)        return res.status(200).json({ status: 'not_found' });
      if (u.blocked) return res.status(200).json({ status: 'blocked' });

      const token = generateToken({ id: u.id, username: u.username, role: u.role });
      return res.status(200).json({ status: 'ok', id: u.id, username: u.username, full_name: u.full_name, role: u.role, token });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function generateToken(payload) {
  const crypto  = require('crypto');
  const secret  = process.env.AVEXI_SECRET || 'avexi-secret';
  const encoded = Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })).toString('base64');
  const sig     = crypto.createHmac('sha256', secret).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}
