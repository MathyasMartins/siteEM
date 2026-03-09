// ============================================================================
// SERVICE WORKER - PWA (Progressive Web App)
// ============================================================================

const CACHE_NAME = 'site-romantico-v2';

const urlsToCache = [
  '/siteEM/',
  '/siteEM/index.html',
  '/siteEM/galeria.html',
  '/siteEM/admin.html',
  '/siteEM/surpresa.html',
  '/siteEM/style.css',
  '/siteEM/script.js',
  '/siteEM/manifest.json',
  '/siteEM/pages/index.js',
  '/siteEM/pages/galeria.js',
  '/siteEM/pages/admin.js',
  '/siteEM/pages/surpresa.js'
];

// ============================================================================
// INSTALAR SERVICE WORKER
// ============================================================================

self.addEventListener('install', (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
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
            console.log('Deletando cache antigo:', cacheName);
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

  // --------------------------------------------------------------------------
  // NÃO INTERFERIR COM ONESIGNAL
  // --------------------------------------------------------------------------

  if (event.request.url.includes("OneSignal")) {
    return;
  }

  // --------------------------------------------------------------------------
  // NÃO INTERCEPTAR REQUISIÇÕES EXTERNAS
  // --------------------------------------------------------------------------

  if (url.origin !== self.location.origin) {
    return;
  }

  // --------------------------------------------------------------------------
  // NÃO INTERCEPTAR APIS OU SERVIÇOS EXTERNOS
  // --------------------------------------------------------------------------

  if (
    url.pathname.includes('/rest/v1/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('onesignal.com') ||
    url.hostname.includes('cdn.onesignal.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // --------------------------------------------------------------------------
  // APENAS REQUISIÇÕES GET
  // --------------------------------------------------------------------------

  if (event.request.method !== 'GET') {
    return;
  }

  // --------------------------------------------------------------------------
  // CACHE FIRST (offline support)
  // --------------------------------------------------------------------------

  event.respondWith(

    caches.match(event.request)

      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)

          .then((networkResponse) => {

            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === 'error'
            ) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;

          })

          .catch(() => {

            if (event.request.destination === 'document') {
              return caches.match('/siteEM/index.html');
            }

          });

      })

  );

});

// ============================================================================
// FIM DO SERVICE WORKER
// ============================================================================