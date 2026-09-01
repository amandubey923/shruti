// SHRUTI — Minimal service worker stub
// Prevents 404 errors. Extend here for offline/caching if needed in future.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

