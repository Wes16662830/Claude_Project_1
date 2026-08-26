// Self-destructing service worker.
// The app used to live at /Claude_Project_1/ and registered a worker here that
// cached the whole site. The app has since moved to /Claude_Project_1/hyrox/,
// so this old worker was hijacking navigations and serving the stale app.
// This replacement unregisters itself, clears all old caches, and sends any
// stuck windows to the new location.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch (e) { /* ignore */ }
    try { await self.registration.unregister() } catch (e) { /* ignore */ }
    const clients = await self.clients.matchAll({ type: 'window' })
    for (const client of clients) {
      try { client.navigate('/Claude_Project_1/hyrox/') } catch (e) { /* ignore */ }
    }
  })())
})
