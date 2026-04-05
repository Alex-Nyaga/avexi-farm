// netlify/functions/db.js
// Handles farm_data reads and writes — Supabase key stays server-side only

const SUPA_URL  = process.env.SUPA_URL;
const SUPA_KEY  = process.env.SUPA_SERVICE_KEY;
const HEADERS   = {
  'Content-Type': 'application/json',
  'apikey': SUPA_KEY,
  'Authorization': 'Bearer ' + SUPA_KEY
};

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-avexi-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  // Verify the session token passed from the browser
  const token = event.headers['x-avexi-token'];
  if (!token || !verifyToken(token)) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Fetch farm data from Supabase
      const res = await fetch(`${SUPA_URL}/rest/v1/farm_data?key=eq.avexi_main&select=data,updated_at`, {
        headers: HEADERS
      });
      const rows = await res.json();
      const data       = rows?.[0]?.data       || null;
      const updated_at = rows?.[0]?.updated_at || null;
      return { statusCode: 200, headers: cors, body: JSON.stringify({ data, updated_at }) };
    }

    if (event.httpMethod === 'POST') {
      // Save farm data to Supabase
      const { data } = JSON.parse(event.body);
      const updated_at = new Date().toISOString();
      const res = await fetch(`${SUPA_URL}/rest/v1/farm_data`, {
        method: 'POST',
        headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ key: 'avexi_main', data, updated_at })
      });
      const ok = res.status >= 200 && res.status < 300;
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok, updated_at }) };
    }

    return { statusCode: 405, headers: cors, body: 'Method not allowed' };

  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};

function verifyToken(token) {
  try {
    const secret = process.env.AVEXI_SECRET || 'avexi-default-secret-change-me';
    const [payload, sig] = token.split('.');
    const { ts } = JSON.parse(Buffer.from(payload, 'base64').toString());
    // Token valid for 24 hours
    if (Date.now() - ts > 86400000) return false;
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return sig === expected;
  } catch { return false; }
}
