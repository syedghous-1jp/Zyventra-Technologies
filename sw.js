const CACHE_NAME = 'zyventra-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/zyventra-icon-logo.png'
];

// 1. Service Worker Install aur Assets Cache karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zyventra Cache Opened');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log("Cache error:", err));
    })
  );
  self.skipWaiting();
});

// 2. Service Worker Activate karna
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 3. Fetch Requests ko handle karna
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
