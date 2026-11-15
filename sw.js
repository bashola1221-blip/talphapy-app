// sw.js - Service Worker for PWA and Notifications

// Minimal fetch listener to enable PWA installation
self.addEventListener('fetch', () => {});

// Listen for messages from the main page (nav.js)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_REMINDER') {
        const { title, body, icon } = event.data.payload;
        
        self.registration.showNotification(title, {
            body: body,
            icon: icon || 'https://i.postimg.cc/RZngpbRM/IMG-20261102-WA0804.jpg', // Your Talphapy logo
            badge: icon || 'https://i.postimg.cc/RZngpbRM/IMG-20261102-WA0804.jpg',
            vibrate: [200, 100, 200],
            requireInteraction: true // Makes the notification stay on screen until clicked
        });
    }
});
