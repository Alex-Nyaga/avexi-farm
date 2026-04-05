// netlify/functions/logs.js
// Handles login log inserts and reads — server-side only

const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;
const HEADERS  = {
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

  try {
    if (event.httpMethod === 'POST') {
      // Insert a login log entry — open, no token needed (called right after login)
      const body = JSON.parse(event.body);
      await fetch(`${SUPA_URL}/rest/v1/login_logs`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body)
      });
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'GET') {
      // Only admins/owners can read logs — token required
      const token = event.headers['x-avexi-token'];
      if (!token || !verifyToken(token)) {
        return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      const date = event.queryStringParameters?.date;
      let url = `${SUPA_URL}/rest/v1/login_logs?order=logged_in_at.desc&limit=100`;
      if (date) url += `&date=eq.${date}`;
      const res  = await fetch(url, { headers: HEADERS });
      const data = await res.json();
      return { statusCode: 200, headers: cors, body: JSON.stringify(data) };
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
    if (Date.now() - ts > 86400000) return false;
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return sig === expected;
  } catch { return false; }
}
