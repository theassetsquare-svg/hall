/* 일산명월관요정 — Service Worker v1.0 (2026-05-21)
   캐시 전략: HTML stale-while-revalidate, 정적자원 cache-first */
const CACHE_VERSION = 'mwk-v1-20260521';
const CORE = [
  '/',
  '/style.css',
  '/script.js',
  '/favicon.svg',
  '/og-image.png',
  '/site.webmanifest',
  '/tradition/',
  '/music/',
  '/rooms/',
  '/atmosphere/',
  '/review/',
  '/faq/',
  '/contact/'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isHTML = req.mode === 'navigate' || req.destination === 'document';

  if (isHTML) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('/')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => cached))
  );
});
