// Service Worker de Nara Stats — habilita instalación como PWA y uso básico offline.
//
// Estrategia:
// - App shell (rutas y assets estáticos) → cache-first con actualización en segundo plano.
// - Navegación (cambio de pantalla) → red primero; si falla (sin conexión), usa la copia
//   cacheada de esa ruta si existe, o el fallback estático /offline.html.
//
// Importante: los datos (partidos, rivales) viven en Postgres y se piden vía Server
// Actions — sin conexión no se pueden cargar datos nuevos ni guardar partidos. Esto da
// una experiencia "shell offline" (abre sin pantalla blanca, muestra la última UI vista),
// no sincronización de datos offline real.

const CACHE_VERSION = "nara-stats-v2";
const APP_SHELL = [
  "/",
  "/games",
  "/opponents",
  "/new-game",
  "/performance",
  "/manifest.json",
  "/favicon.ico",
  "/icon0.svg",
  "/apple-icon.png",
  "/icon1.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET; dejar pasar todo lo demás (server actions, POST, etc.) sin interceptar.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación entre pantallas: red primero, cache como respaldo offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ||
            (await caches.match("/offline.html")),
        ),
    );
    return;
  }

  // Assets estáticos (JS/CSS/imágenes propias): cache-first, refresco en segundo plano.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
