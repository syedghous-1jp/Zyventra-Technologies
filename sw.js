const CACHE_NAME = 'zyventra-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/app.html',
  '/manifest.json',
  '/zyventra-icon-logo.png'
];

// Total files for progress tracking
const TOTAL_FILES = ASSETS_TO_CACHE.length;
let downloadedFiles = 0;

// ============================================================
// 1. INSTALL — With Progress Tracking
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Zyventra Cache Opened (v3)');
      
      // Progress tracking ke liye
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}`);
              }
              return cache.put(url, response);
            })
            .then(() => {
              downloadedFiles++;
              const progress = Math.round((downloadedFiles / TOTAL_FILES) * 100);
              console.log(`📊 Download Progress: ${progress}% (${downloadedFiles}/${TOTAL_FILES})`);
              
              // Send progress to all clients
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({
                    type: 'INSTALL_PROGRESS',
                    progress: progress,
                    file: url,
                    total: TOTAL_FILES,
                    downloaded: downloadedFiles
                  });
                });
              });
            })
            .catch(err => console.log('❌ Cache error for:', url, err));
        })
      );
    })
    .then(() => {
      console.log('✅ Zyventra: All files cached!');
      return self.skipWaiting();
    })
  );
});

// ============================================================
// 2. ACTIVATE — Purani Cache Delete Karega
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('✅ Zyventra: Activated!');
      return self.clients.claim();
    })
  );
});

// ============================================================
// 3. FETCH — Network-First Strategy
// ============================================================
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// ============================================================
// 4. MESSAGE — Progress Status Send Karega
// ============================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_PROGRESS') {
    event.ports[0].postMessage({
      progress: Math.round((downloadedFiles / TOTAL_FILES) * 100),
      downloaded: downloadedFiles,
      total: TOTAL_FILES
    });
  }
});
