// Utility functions that are used across the application

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export const today = () => new Date().toISOString().slice(0, 10);

export const fd = (d) => {
  if (!d) return '—';
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return d;
  }
};

export const ksh = (n) => 'KES ' + Number(n || 0).toLocaleString();

export const ageStr = (dob) => {
  if (!dob) return '—';
  const m = (new Date() - new Date(dob + 'T12:00:00')) / (1000 * 60 * 60 * 24 * 30.44);
  return m < 12 ? Math.round(m) + 'm' : Math.floor(m / 12) + 'y ' + Math.round(m % 12) + 'm';
};

export const daysDiff = (d) => {
  if (!d) return null;
  return Math.round((new Date(d + 'T12:00:00') - new Date()) / (1000 * 60 * 60 * 24));
};

export const nowTs = () => {
  return new Date().toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const sha256 = async (str) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};