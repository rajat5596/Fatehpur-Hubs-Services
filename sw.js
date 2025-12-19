// Service Worker Version: Caching ko force update karne ke liye ise badalte rahein
const CACHE_VERSION = 'app_cache_v3.0'; 

// Woh files jinko cache karna hai (is list mein aapke sabhi critical assets hone chahiye)
// Apne HTML, CSS, JS aur icons ko yahan shamil karein
const urlsToCache = [
    './', // index.html
    './index.html',
    './css/style.css', // Agar aapke paas separate CSS file hai
    './js/script.js', // Agar aapke paas separate JS file hai
    './manifest.json',
    // Yahan aapke main icons ya assets ke paths ho sakte hain
    // '/icons/icon-192x192.png', 
    // '/icons/icon-512x512.png'
];

// **********************************************
// 1. INSTALLATION (Cache files)
// **********************************************
self.addEventListener('install', (event) => {
    // Service Worker ko turant activate karne ke liye (important for updates)
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => {
                console.log('[Service Worker] Caching files for version:', CACHE_VERSION);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Caching failed:', error);
            })
    );
});

// **********************************************
// 2. ACTIVATION (Clean up old caches)
// **********************************************
self.addEventListener('activate', (event) => {
    // Naye Service Worker ko turant control lene dein
    event.waitUntil(self.clients.claim()); 

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Purane cache ko delete karein
                    if (cacheName !== CACHE_VERSION) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// **********************************************
// 3. FETCHING (Serve from cache, fallback to network)
// **********************************************
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Agar cache mein response milta hai, to woh return karein
                if (response) {
                    return response;
                }
                
                // Warna network se fetch karein
                return fetch(event.request).catch((error) => {
                    console.error('[Service Worker] Fetch failed:', error);
                    // Agar koi offline fallback page hai to yahan return kar sakte hain
                    // return caches.match('/offline.html');
                });
            })
    );
});

// **********************************************
// Important: Agar aapne sab kuch ek hi index.html file mein rakha hai (jaisa humne kiya),
// to yeh Service Worker 'index.html' ko cache karega.
// Cache update karne ke liye, aapko CACHE_VERSION string ko hamesha badalna hoga.
// **********************************************

