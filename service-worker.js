const CACHE_NAME = 'buspartsmanager-v2';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie "réseau d'abord" pour les fichiers de l'app : on veut toujours la
// dernière version en ligne (fini les vieilles versions bloquées en cache).
// Si le réseau est indisponible, on retombe sur le cache local (mode hors-ligne).
// Les requêtes vers Firebase/Firestore ne sont JAMAIS interceptées : elles
// passent directement au réseau, Firestore gère lui-même son propre cache.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('firestore.googleapis.com') || url.includes('firebaseio.com') || url.includes('googleapis.com')) {
    return; // laisser passer, ne pas intercepter
  }
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
