// Offline-Speicher: Die App funktioniert nach dem ersten Öffnen auch ohne Internet.
// Bei jeder neuen Version VERSION erhöhen.
const VERSION = 'sirchhausen-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/app.js', 'js/store.js', 'js/nav.js', 'js/ui.js', 'js/audio.js', 'js/speech.js', 'js/motion.js', 'js/pin.js', 'js/breaks.js', 'js/activities.js',
  'js/art/person.js', 'js/art/plush.js', 'js/art/village.js', 'js/art/bailey.js',
  'js/screens/profiles.js', 'js/screens/editor.js', 'js/screens/plushpick.js', 'js/screens/village.js', 'js/screens/parents.js', 'js/screens/starjar.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Erst aus dem Speicher (schnell & offline), im Hintergrund aktualisieren
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const fresh = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => cached);
      return cached || fresh;
    }),
  );
});
