// Service worker for Atlas PWA
// Satisfies PWA installability requirements while explicitly avoiding offline caching/access.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Always fetch directly from network to prevent any offline storage/access
  event.respondWith(fetch(event.request));
});
