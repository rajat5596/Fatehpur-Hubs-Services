// 1. Firebase Scripts ko load karna
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// 2. Firebase ko Initialize karna (Aapki Config Details)
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

// 3. Background Notification Handler (Jab App band ho tab ke liye)
messaging.onBackgroundMessage(function(payload) {
    console.log('[sw.js] Background Message Mila: ', payload);
    const notificationTitle = payload.notification ? payload.notification.title : 'Nayi Job Alert!';
    const notificationOptions = {
        body: payload.notification ? payload.notification.body : 'Fatehpur Hubs par naya update hai. Check karein!',
        icon: './img/icon.png',
        badge: './img/icon.png',
        data: { url: 'https://fatehpurhubs.co.in' }
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Caching Setup (Taki App offline chale aur layout sahi rahe)
const CACHE_VERSION = 'fatehpur_v15'; // Version badal diya taaki naya load ho
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
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(urlsToCache))
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
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

