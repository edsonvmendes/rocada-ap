// ============================================================
// SERVICE WORKER - Suporte offline para PWA
// ============================================================

const CACHE_NAME = "rocada-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/admin",
  "/manifest.json",
];

// Instala e faz cache dos assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignora erros individuais de cache
      });
    })
  );
  self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercepta requisições - Network First, fallback para cache
self.addEventListener("fetch", (event) => {
  // Ignora requisições externas (Google Apps Script, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Salva no cache se for bem-sucedido
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Sem internet: busca no cache
        return caches.match(event.request).then((cached) => {
          return cached || new Response("Offline - sem conexão", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});
