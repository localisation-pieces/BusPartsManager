// Ce fichier n'existait plus sur le serveur, mais un ancien service worker
// (enregistré il y a plusieurs jours, avant qu'on retravaille l'appli) est
// resté actif sur certains appareils — il continuait à servir une VERSION
// EN CACHE, ancienne, de l'appli, sans jamais se mettre à jour, quel que
// soit le contenu réellement présent sur GitHub. C'est ce qui expliquait
// que les corrections récentes (menu mobile, filtres, grille...)
// n'apparaissaient jamais, malgré le fichier bien remplacé sur GitHub.
//
// Ce nouveau service-worker.js est un "interrupteur" : il supprime tous les
// anciens caches, puis se désinstalle lui-même définitivement. Après son
// passage, l'appli n'utilise plus AUCUN service worker — chaque
// rechargement va chercher la vraie version en ligne, comme n'importe quel
// site web classique. Rien ne doit être modifié dans ce fichier après coup.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});
