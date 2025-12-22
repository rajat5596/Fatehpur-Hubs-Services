
// firebase-messaging-sw.js
console.log("Service Worker: Firebase Messaging loaded");

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA37JsLUIG-kypZ55vdpLTp3WKHgRH2IwY",
  authDomain: "fatehpur-hubs-a3a9f.firebaseapp.com",
  databaseURL: "https://fatehpur-hubs-a3a9f-default-rtdb.asia-southeast1.firebasedatabase.app",
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
  console.log("Background message received:", payload);
  
  const notificationTitle = payload.notification?.title || "Fatehpur Hubs";
  const notificationOptions = {
    body: payload.notification?.body || "New update available",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge.png",
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
