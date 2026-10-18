// public/sw.js — VidyAI Service Worker
const CACHE_NAME = "vidyai-v3";
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-72.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/badge-72.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Safe add: cache what is available without failing the whole installation
      for (const asset of APP_SHELL) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn("[SW] Failed to cache initial asset:", asset, err.message);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // HTML page navigations → Network First, fallback to cached offline.html
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match("/offline.html");
        return (
          cachedOffline ||
          new Response("You are offline. Please reconnect.", {
            headers: { "Content-Type": "text/plain" },
          })
        );
      }),
    );
    return;
  }

  // App shell & static icons → Cache First
  if (APP_SHELL.includes(url.pathname)) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
    return;
  }

  // API calls
  if (url.pathname.startsWith("/api/")) {
    if (request.method !== "GET") {
      // Non-GET: pass through directly
      e.respondWith(fetch(request));
      return;
    }
    // GET API: Network First with cache fallback
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then(
              (cached) =>
                cached ||
                new Response(
                  JSON.stringify({ error: "offline", cached: false }),
                  { headers: { "Content-Type": "application/json" } },
                ),
            ),
        ),
    );
    return;
  }

  // Images → Stale While Revalidate
  if (request.destination === "image") {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((res) => {
            if (res.status === 200) {
              cache.put(request, res.clone());
            }
            return res;
          }).catch(() => null);
          return cached || fetchPromise;
        }),
      ),
    );
    return;
  }
});

// Background Sync
self.addEventListener("sync", (e) => {
  if (e.tag === "sync-progress") {
    e.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  const clients = await self.clients.matchAll();
  clients.forEach((c) => c.postMessage({ type: "SYNC_COMPLETE" }));
}

// Push Notifications
self.addEventListener("push", (e) => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "VidyAI", {
      body: data.body || "You have a new update!",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
