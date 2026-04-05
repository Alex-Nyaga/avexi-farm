// netlify/functions/auth.js
const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: 'Method not allowed' };

  try {
    const { action, username, password, userId } = JSON.parse(event.body);

    const HEADERS = {
      'Content-Type': 'application/json',
      'apikey': SUPA_KEY,
      'Authorization': 'Bearer ' + SUPA_KEY
    };

    if (action === 'login') {
      // Get all users
      const res  = await fetch(`${SUPA_URL}/rest/v1/app_users?select=*`, { headers: HEADERS });
      const rows = await res.json();

      if (!Array.isArray(rows)) {
        return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Could not reach database. Check SUPA_URL and SUPA_SERVICE_KEY in Netlify environment variables.' }) };
      }

      // Case-insensitive username match
      const u = rows.find(r => r.username.toLowerCase() === username.toLowerCase());

      if (!u) return { statusCode: 200, headers: cors, body: JSON.stringify({ status: 'wrong', attempts_left: 2 }) };
      if (u.blocked) return { statusCode: 200, headers: cors, body: JSON.stringify({ status: 'blocked' }) };

      // FIX: Compare password directly (passwords stored as plain text in pw_hash column)
      if (u.pw_hash !== password) {
        return { statusCode: 200, headers: cors, body: JSON.stringify({ status: 'wrong', attempts_left: 2 }) };
      }

      const token = generateToken({ id: u.id, username: u.username, role: u.role });
      return {
        statusCode: 200, headers: cors,
        body: JSON.stringify({ status: 'ok', id: u.id, username: u.username, full_name: u.full_name, role: u.role, token })
      };
    }

    if (action === 'verify') {
      const res  = await fetch(`${SUPA_URL}/rest/v1/app_users?select=*`, { headers: HEADERS });
      const rows = await res.json();

      if (!Array.isArray(rows)) {
        return { statusCode: 200, headers: cors, body: JSON.stringify({ status: 'not_found' }) };
      }

      const u = rows.find(r => r.id === userId);

      if (!u)        return { statusCode: 200, headers: cors, body: JSON.stringify({ status: 'not_found' }) };
      if (u.blocked) return { statusCode: 200, headers: cors, body: JSON.stringify({ status: 'blocked' }) };

      const token = generateToken({ id: u.id, username: u.username, role: u.role });
      return {
        statusCode: 200, headers: cors,
        body: JSON.stringify({ status: 'ok', id: u.id, username: u.username, full_name: u.full_name, role: u.role, token })
      };
    }

    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};

function generateToken(payload) {
  const crypto  = require('crypto');
  const secret  = process.env.AVEXI_SECRET || 'avexi-default-secret-change-me';
  const encoded = Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })).toString('base64');
  const sig     = crypto.createHmac('sha256', secret).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}
