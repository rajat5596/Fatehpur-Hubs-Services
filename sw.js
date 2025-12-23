// sw.js - Fatehpur Hubs Final Push Notification Support (Background + Foreground)

console.log('✅ Fatehpur Hubs Service Worker Loaded');

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Tumhari Firebase Config (pura complete)
firebase.initializeApp({
  apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
  authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
  databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fatehpur-hubs-a3a9f",
  storageBucket: "fatehpur-hubs-a3a9f.appspot.com",
  messagingSenderId: "294360741451",
  appId: "1:294360741451:web:3bc85078805750b9fabfce"
});

const messaging = firebase.messaging();

// Background mein notification dikhaane ka code (app band ya background mein bhi chalega)
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Background Message Received:', payload);

  const notificationTitle = payload.notification?.title || 'Fatehpur Hubs Update';
  const notificationOptions = {
    body: payload.notification?.body || 'Nayi service ya job aayi hai!',
    icon: 'https://www.fatehpurhubs.co.in/icons/icon-192x192.png',
    badge: 'https://www.fatehpurhubs.co.in/icons/icon-192x192.png',
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Tumhara purana service worker code (PWA ke liye zaroori)
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker Activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Normal browser handling
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification Clicked');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('fatehpurhubs') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('✅ Service Worker fully ready with push support!');
