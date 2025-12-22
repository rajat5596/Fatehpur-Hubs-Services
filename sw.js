// sw.js - Service Worker for Fatehpur Hubs

// ============== FIREBASE CLOUD MESSAGING SETUP ==============
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
  authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
  databaseURL: "https://fatehpurhubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fatehpur-hubs-a3a9f",
  storageBucket: "fatehpur-hubs-a3a9f.firebasestorage.app",
  messagingSenderId: "294360741451",
  appId: "1:294360741451:web:3bc85078805750b9fabfce"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function(payload) {
  console.log('[sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Fatehpur Hubs';
  const notificationOptions = {
    body: payload.notification?.body || 'New update available',
    icon: 'https://www.fatehpurhubs.co.in/icons/icon-192x192.png',
    badge: 'https://www.fatehpurhubs.co.in/icons/badge.png',
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

console.log('[sw.js] Service Worker loaded successfully');
