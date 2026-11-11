// Offline-Speicher: Die App funktioniert nach dem ersten Öffnen auch ohne Internet.
// Bei jeder neuen Version VERSION erhöhen.
const VERSION = 'sirchhausen-v5';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/app.js', 'js/store.js', 'js/nav.js', 'js/ui.js', 'js/audio.js', 'js/speech.js', 'js/motion.js', 'js/pin.js', 'js/breaks.js', 'js/activities.js',
  'js/art/person.js', 'js/art/plush.js', 'js/art/village.js', 'js/art/bailey.js',
  'js/media.js', 'js/pet.js', 'js/art/coloring.js',
  'js/games/shell.js', 'js/games/tamagotchi.js', 'js/games/memory.js', 'js/games/paint.js', 'js/games/teeth.js', 'js/games/music.js', 'js/screens/house.js',
  'js/games/drag.js', 'js/games/baking.js', 'js/games/puzzle.js', 'js/games/search.js', 'js/games/sorting.js', 'js/games/wardrobe.js',
  'js/season.js', 'js/viewport.js', 'js/screens/games.js', 'js/games/farm.js', 'js/games/build.js', 'js/games/bike.js', 'js/screens/visit.js', 'js/screens/festive.js',
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
