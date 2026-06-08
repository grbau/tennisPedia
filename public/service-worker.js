// Nom du cache
const CACHE_NAME = 'tennispedia-cache-v1';
// Fichiers à mettre en cache
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  // Ajoutez ici d'autres ressources statiques importantes (CSS, JS, images)
];

// Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Interception des requêtes et renvoi des ressources depuis le cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});