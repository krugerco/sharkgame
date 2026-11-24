// Network-first service worker: always tries fresh files, falls back to cache
// offline. Bump VERSION to drop old caches.
const VERSION = 'v4';
const CACHE = `deepbite-${VERSION}`;
const CORE = ['/', '/index.html', '/style.css', '/js/main.js', '/js/game.js', '/js/art.js', '/js/config.js',
  '/js/input.js', '/js/audio.js', '/js/ui.js', '/js/util.js', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/')))
  );
});
