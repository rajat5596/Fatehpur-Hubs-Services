// sw.js - SIMPLE Service Worker
console.log('✅ Service Worker installed');

// Listen for install event
self.addEventListener('install', function(event) {
  console.log('✅ Service Worker installing...');
  self.skipWaiting(); // Force activation
});

// Listen for activate event
self.addEventListener('activate', function(event) {
  console.log('✅ Service Worker activated');
  event.waitUntil(self.clients.claim()); // Take control immediately
});

// Basic fetch handler (required for PWA)
self.addEventListener('fetch', function(event) {
  // Let browser handle normally
  return;
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
    .then(function(clientList) {
      // Focus existing app window
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('fatehpurhubs') && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('✅ Service Worker code loaded');
