// Pin High service worker
// Offline-first for static assets, network-first for app-shell navigations.
//
// Important: Vite emits hashed JS/CSS chunks. If "/" is served cache-first after a
// deploy, old HTML can point at chunks Vercel has already removed, producing a
// white screen. Navigations must therefore check the network first, then fall
// back to the last cached app shell for true offline use.

const CACHE_VERSION = "v4";
const STATIC_CACHE = `pin-high-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `pin-high-runtime-${CACHE_VERSION}`;
const CACHE_PREFIX = "pin-high-";

const STATIC_ASSETS = [
  "/manifest.json",
  "/favicon.ico",
  "/favicon.png",
  "/favicon.svg",
  "/icons.svg",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/pin-high-logo.jpg",
  "/tee-wallpaper.jpg",
];

async function cacheResponse(cacheName, request, response) {
  if (!response || response.status !== 200 || response.type === "opaque") return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function cacheAppShell(response) {
  if (!response || response.status !== 200) return;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put("/", response.clone());
  await cache.put("/index.html", response.clone());
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((error) => {
        console.warn("Pin High static precache skipped one or more assets:", error);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            const isPinHighCache = cacheName.startsWith(CACHE_PREFIX);
            const isCurrentCache = cacheName === STATIC_CACHE || cacheName === RUNTIME_CACHE;
            if (isPinHighCache && !isCurrentCache) {
              return caches.delete(cacheName);
            }
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

async function handleNavigation(request) {
  try {
    const fresh = await fetch(request, { cache: "no-store" });
    await cacheAppShell(fresh.clone());
    return fresh;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match("/")) ||
      (await caches.match("/index.html")) ||
      new Response(
        "<!doctype html><title>Pin High Offline</title><body style=\"margin:0;background:#1A1A1A;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px\"><main><h1 style=\"color:#E87722\">Pin High</h1><p>Offline app shell unavailable. Reconnect once to refresh the scorecard.</p></main></body>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      )
    );
  }
}

async function handleAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const isBuildAsset = request.url.includes("/assets/");
  await cacheResponse(isBuildAsset ? STATIC_CACHE : RUNTIME_CACHE, request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (!request.url.startsWith(self.location.origin)) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(
    handleAsset(request).catch(async () => {
      const fallback = await caches.match(request);
      if (fallback) return fallback;
      throw new Error(`Pin High offline cache miss: ${request.url}`);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.filter((name) => name.startsWith(CACHE_PREFIX)).map((name) => caches.delete(name)))
        )
    );
  }
});
