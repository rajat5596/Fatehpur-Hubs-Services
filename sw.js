// sw.js - Fatehpur Hubs Push Notification Support

console.log('✅ Service Worker started');

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 🔥 Yahan apni Firebase config paste kar do (script.js ya notification.js se copy kar lo)
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Yeh background mein notification dikha dega
messaging.onBackgroundMessage((payload) => {
  console.log('Background notification mila:', payload);

  const title = payload.notification?.title || 'Fatehpur Hubs';
  const options = {
    body: payload.notification?.body || 'Naya update aaya!',
    icon: 'https://www.fatehpurhubs.co.in/icons/icon-192x192.png'
  };

  return self.registration.showNotification(title, options);
});

// Tumhara purana code yahan se
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
