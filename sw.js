// --- FIREBASE NOTIFICATION SETUP ---
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
  authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
  databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fatehpur-hubs-a3a9f",
  storageBucket: "fatehpur-hubs-a3a9f.firebasestorage.app",
  messagingSenderId: "294360741451",
  appId: "1:294360741451:web:3bc85078805750b9fabfce"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './img/icon.png' 
  };
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- CACHING SETUP ---
const CACHE_VERSION = 'app_cache_v3.1'; 
const urlsToCache = [
    './', 
    './index.html',
    './style.css', 
    './script.js', 
    './manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); 
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_VERSION) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

