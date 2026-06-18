// Service Worker — SaludGO PWA
const CACHE_NAME = 'saludgo-v1';
const OFFLINE_URL = '/offline.html';

// Recursos que se guardan en caché al instalar
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/offline.html',
];

// Instalar SW y cachear recursos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: Network First → fallback Cache → fallback Offline
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET del mismo origen o CDN de imágenes
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // No interceptar llamadas a Supabase ni a Stripe
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('stripe.com') ||
    url.hostname.includes('supabase.io')
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardar copia fresca en caché si es válida
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Para navegación, devolver página offline
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('', { status: 408 });
        })
      )
  );
});
