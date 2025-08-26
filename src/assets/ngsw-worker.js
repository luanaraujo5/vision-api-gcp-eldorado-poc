// Service Worker para Vision API Frontend PWA
const CACHE_NAME = 'vision-api-v1.0.0';
const STATIC_CACHE = 'vision-api-static-v1.0.0';
const DYNAMIC_CACHE = 'vision-api-dynamic-v1.0.0';

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/assets/manifest.json',
  '/assets/logo-branco.svg',
  '/assets/favicon.ico'
];

// Estratégia de cache: Cache First para arquivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Estratégia de cache: Network First para API calls
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache para arquivos estáticos
  if (request.method === 'GET' && STATIC_FILES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // Cache para API calls com fallback offline
  if (request.method === 'POST' && url.pathname.includes('vision.googleapis.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone a resposta para cache
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // Fallback para cache offline
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Retorna uma resposta offline padrão
              return new Response(
                JSON.stringify({
                  error: 'Sem conexão com a internet. Tente novamente quando estiver online.',
                  offline: true
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
            });
        })
    );
    return;
  }

  // Para outras requisições, usa Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache de respostas bem-sucedidas
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback para cache
        return caches.match(request);
      })
  );
});

// Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Intercepta mensagens do app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
