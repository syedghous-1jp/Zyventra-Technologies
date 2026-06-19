const CACHE_NAME = 'zyventra-cache-v3';
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

// 3. Fetch Requests ko handle karna (Network-First Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Pehle hamesha internet (network) se naya data fetch karne ki koshish karega
    fetch(event.request)
      .then((networkResponse) => {
        // Agar network sahi chal raha hai, toh naya response cache mein save karein aur return karein
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Agar internet nahi chal raha (offline hai), toh cache se file uthaye
        return caches.match(event.request);
      })
  );
});
