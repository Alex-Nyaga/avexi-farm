import bcrypt from 'bcryptjs';
import { issueToken, setCors } from './_auth.js';

const SUPA_URL = process.env.SUPA_URL;
const SUPA_KEY = process.env.SUPA_SERVICE_KEY;

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPA_URL || !SUPA_KEY) return res.status(500).json({ error: 'Authentication service is not configured' });

  const { action, username, password, userId } = req.body || {};
  if (action !== 'login' && action !== 'verify') return res.status(400).json({ error: 'Unknown action' });
  if (action === 'login' && (typeof username !== 'string' || typeof password !== 'string' || password.length < 8)) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (action === 'verify' && typeof userId !== 'string') return res.status(400).json({ error: 'User id is required' });

  try {
    const filter = action === 'login' ? `username=ilike.${encodeURIComponent(username.trim())}` : `id=eq.${encodeURIComponent(userId)}`;
    const response = await fetch(`${SUPA_URL}/rest/v1/app_users?select=id,username,full_name,role,blocked,pw_hash&${filter}&limit=1`, {
      headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
    });
    if (!response.ok) return res.status(502).json({ error: 'Authentication service unavailable' });
    const [user] = await response.json();
    if (!user || user.blocked) return res.status(401).json({ status: user?.blocked ? 'blocked' : 'wrong' });
    if (action === 'login' && (!user.pw_hash || !(await bcrypt.compare(password, user.pw_hash)))) {
      return res.status(401).json({ status: 'wrong' });
    }
    const token = issueToken({ id: user.id, username: user.username, role: user.role });
    return res.status(200).json({ status: 'ok', id: user.id, username: user.username, full_name: user.full_name, role: user.role, token });
  } catch (error) {
    console.error('auth request failed', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
