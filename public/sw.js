const STATIC_CACHE = 'smartinvites-static-v1';
const DYNAMIC_CACHE = 'smartinvites-dynamic-v1';

const PRECACHE_ASSETS = [
  '/',
  '/logo.svg',
  '/logo-180.png',
  '/templates',
  '/demo/pastel-paradise',
  '/demo/royal-imperial'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    event.waitUntil(
      self.registration.unregister().then(() => {
        return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      })
    );
    return;
  }

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept in localhost/development or Turbopack HMR chunks
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.includes('/_next/webpack-hmr') ||
    url.pathname.includes('/_next/turbopack')
  ) {
    return;
  }

  // Only handle GET requests and http/https schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Bypass API and auth routes from offline caching
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) {
    return;
  }

  // Handle invitation and demo routes: Network-First with Cache Fallback
  if (url.pathname.startsWith('/inv/') || url.pathname.startsWith('/demo/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;

          // Return offline invitation fallback page
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Offline — Smart Invites</title>
              <style>
                body { background: #0b0f14; color: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
                .card { background: #121820; border: 1px solid rgba(212, 168, 83, 0.3); border-radius: 20px; padding: 32px 24px; max-width: 420px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
                h1 { color: #d4a853; font-size: 22px; margin-bottom: 8px; }
                p { font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }
                .btn { background: #d4a853; color: #0b0f14; font-weight: bold; padding: 12px 24px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 13px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div style="font-size: 40px; margin-bottom: 12px;">📡</div>
                <h1>Low Signal / Offline Mode</h1>
                <p>You appear to be in a low-reception area or banquet hall with no connection. Previously viewed invitations remain available from your browser cache.</p>
                <a href="javascript:window.location.reload()" class="btn">Tap to Reconnect</a>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // Handle static assets (Stale-While-Revalidate)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|css|js|woff2?)$/)
  ) {
    // Only intercept same-origin static assets and Supabase CDN images
    if (url.origin !== self.location.origin && !url.hostname.includes('supabase.co')) {
      return;
    }

    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => {
            if (cachedResponse) return cachedResponse;
            return new Response(null, { status: 404, statusText: 'Asset not found' });
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
