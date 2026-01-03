
const CACHE_NAME = 'aetheria-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap'
];

const EXTERNAL_ORIGINS = [
  'esm.sh',
  'fonts.gstatic.com',
  'images.unsplash.com',
  'picsum.photos'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(ASSETS.map(asset => cache.add(asset)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  const isExternal = EXTERNAL_ORIGINS.some(origin => url.hostname.includes(origin));
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin && !isExternal) {
    // For same-origin requests not explicitly in ASSETS, check if they are build assets
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                }).catch(() => {
                    // If fetching fails and not in cache, respond with a generic 404 or offline page
                    return new Response('Offline asset unavailable', { status: 404 });
                });
            })
        );
        return;
    }
    return; // Don't handle other non-same-origin, non-external requests
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        // Only cache basic responses or specific external ones
        const isCacheable = response.type === 'basic' || response.type === 'cors';
        if (isCacheable) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Fallback for images if offline
        if (event.request.destination === 'image') {
          return caches.match('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=192&h=192&auto=format&fit=crop');
        }
        return new Response('Offline content unavailable', { status: 408 });
      });
    })
  );
});
