// sw.js - 100% SAFE SERVICE WORKER (NO POP-UP, NO VIRUS)
const CACHE = 'fatehpur-hubs-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/script.js',
        '/ads.js',
        '/manifest.json',
        '/file_0000000059806208b25eb7951e979b96.png'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});