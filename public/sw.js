// Pin High — Service Worker
// Cache-first strategy: serve from cache, update in background

const CACHE_NAME = 'pin-high-v2';
const RUNTIME_CACHE = 'pin-high-runtime-v2';

// Assets to cache on install
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icons.svg',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/pin-high-logo.jpg',
  '/tee-wallpaper.jpg',
];

// Install: cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache opened:', CACHE_NAME);
      return cache.addAll(CACHE_ASSETS).catch(err => {
        console.warn('Cache addAll failed (some assets may be missing):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy
// For offline play on the course, serve from cache first
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      // Serve from cache if available
      if (response) {
        // Update cache in background
        fetch(request).then(freshResponse => {
          if (freshResponse && freshResponse.status === 200) {
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, freshResponse);
            });
          }
        }).catch(() => {
          // Network error, keep serving from cache
        });
        return response;
      }

      // Not in cache, try network
      return fetch(request).then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const cacheName = request.url.includes('.js') || request.url.includes('.css')
            ? CACHE_NAME
            : RUNTIME_CACHE;
          caches.open(cacheName).then(cache => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Network failed, return offline page if available
        return caches.match('/index.html');
      });
    })
  );
});

// Message handler for cache control
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    });
  }
});
