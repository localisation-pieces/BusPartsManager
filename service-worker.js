// Chrome sur Android n'autorise une VRAIE installation ("Ajouter à l'écran
// d'accueil" qui ouvre l'appli en plein écran, sans barre de navigateur) que
// si un service worker actif gère l'événement "fetch". Sans lui, le
// raccourci créé rouvre toujours Chrome — c'est ce qui se passait depuis le
// retrait complet du service worker (voir plus bas) suite à l'incident du
// 07/09/2026 (un ancien SW servait une version en cache, plus jamais à
// jour, sur certains appareils).
//
// Pour satisfaire Android SANS reproduire ce bug : ce service worker ne met
// JAMAIS rien en cache. Chaque requête part directement chercher la version
// en ligne, exactement comme un chargement de page normal — juste assez
// pour être installable, sans aucun risque de rester coincé sur une ancienne
// version. Pas de mode hors-ligne pour l'instant (délibéré : ce serait
// réintroduire la même classe de bug pour un gain non demandé).
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
