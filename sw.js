// sw.js - 100% WORKING WITH OTP + PWA + NO POP-UP
const CACHE_NAME = 'fatehpur-hubs-v3'; // ✅ ONLY v3

const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/ads.js',
  '/manifest.json',
  '/file_0000000059806208b25eb7951e979b96.png',
  // YE 3 LINE ADD KI HAIN — OTP KE LIYE ZAROORI HAIN
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js',
  'https://www.google.com/recaptcha/api.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
