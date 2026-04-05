// ═══════════════════════════════════════════════════
//  AVEXI FARM — Service Worker
//  Makes the app installable as a standalone Android app.
//  Also caches the app so it loads fast even on slow data.
// ═══════════════════════════════════════════════════

const CACHE = 'avexi-v3';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// Install — cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first for app shell, network first for Supabase/CDN
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go to network for Supabase, CDNs, fonts
  const alwaysNetwork = ['supabase.co','cdnjs.cloudflare.com','googleapis.com','jsdelivr.net','gstatic.com'];
  if (alwaysNetwork.some(h => url.hostname.includes(h))) {
    return; // let browser handle normally
  }

  // For our own files: try cache, fall back to network
  if (e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
