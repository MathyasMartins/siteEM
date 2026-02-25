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
  // Apenas GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Estratégia: Cache first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache, retornar
        if (response) {
          return response;
        }

        // Caso contrário, fazer requisição de rede
        return fetch(event.request)
          .then((response) => {
            // Não cachear requisições não-sucesso
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clonar a resposta
            const responseToCache = response.clone();

            // Cachear a resposta
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Se offline e não está em cache, retornar página offline
            return caches.match('/index.html');
          });
      })
  );
});

// ============================================================================
// FIM DO SERVICE WORKER
// ============================================================================
