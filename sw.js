// ============================================================================
// SERVICE WORKER - PWA (Progressive Web App)
// ============================================================================
// Gerencia cache de arquivos para funcionamento offline
// ============================================================================

const CACHE_NAME = 'site-romantico-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/galeria.html',
  '/admin.html',
  '/surpresa.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/pages/index.js',
  '/pages/galeria.js',
  '/pages/admin.js',
  '/pages/surpresa.js'
];

// ============================================================================
// INSTALAR SERVICE WORKER
// ============================================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Erro ao cachear arquivos:', error);
      })
  );
  self.skipWaiting();
});

// ============================================================================
// ATIVAR SERVICE WORKER
// ============================================================================

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ============================================================================
// INTERCEPTAR REQUISIÇÕES
// ============================================================================

self.addEventListener('fetch', (event) => {

  const url = new URL(event.request.url);

  // NÃO CACHEAR APIS
  if (
    url.pathname.includes('/rest/v1/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('cloudinary.com')
  ) {
    return; // deixa a requisição ir direto para a internet
  }

  // Apenas GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {

        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {

          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });

      })
  );

});

// ============================================================================
// FIM DO SERVICE WORKER
// ============================================================================
