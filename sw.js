const CACHE_NAME = 'zyventra-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.html',          // <--- APP KA FILE ADD KAR DIYA
  '/manifest.json',
  '/zyventra-icon-logo.png'
];

// 1. Service Worker Install aur Cache karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zyventra Cache Opened (v2)');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log("Cache error:", err));
    })
  );
  self.skipWaiting(); // Naya Service Worker turant active ho jaye
});

// 2. Service Worker Activate karna (Purani cache delete karega)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Control turant le le
  );
});

// 3. Fetch Requests ko handle karna
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
