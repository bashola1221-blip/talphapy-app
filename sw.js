// sw.js - Service Worker for Caching, Pyodide, and Notifications

const CACHE_NAME = 'talphapy-cache-v3';
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/';

// Install & Activate
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => clients.claim())
    );
});

// Intercept Requests
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // 1. PYODIDE - Cache First, then Network
    if (url.startsWith(PYODIDE_CDN)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) {
                    console.log('Loaded Pyodide from cache:', url);
                    return cached;
                }
                return fetch(event.request).then((networkResponse) => {
                    // Only save if it worked
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // 2. YOUR OWN FILES - Cache First, then Network
    if (url.includes('talphapy-app.vercel.app') || url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
        );
    }
});

// --- NOTIFICATIONS ---
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_REMINDER') {
        const { title, body, icon } = event.data.payload;
        self.registration.showNotification(title, {
            body: body,
            icon: icon || 'https://i.postimg.cc/RZngpbRM/IMG-20261102-WA0804.jpg',
            badge: icon || 'https://i.postimg.cc/RZngpbRM/IMG-20261102-WA0804.jpg',
            vibrate: [200, 100, 200],
            requireInteraction: true
        });
    }
});
