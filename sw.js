const CACHE_NAME = 'story-app-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/index.js',
  '/src/styles/main.css',
  '/public/manifest.json',
  '/public/icons/icon-192x192.png',
  '/public/icons/icon-512x512.png',
  // External assets for offline access
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
  // Note: Caching Google Fonts directly might be complex due to dynamic URLs. 
  // For critical fonts, consider self-hosting or more advanced runtime caching strategies.
  // This list focuses on what `cache.addAll` can reliably cache at install time.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Push Notification handling
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'New Notification',
      options: {
        body: 'You have a new notification'
      }
    };
  }

  const title = data.title || 'Story App Notification';
  const options = {
    body: data.options?.body || 'You have a new notification.',
    icon: '/public/icons/icon-512x512.png',
    badge: '/public/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'close',
        title: 'Close',
        icon: '/public/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }
}); 