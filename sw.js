// Cache basic shell (no caching of external audio)
const CACHE = "sadaqah-shell-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.url.startsWith("https://download.quranicaudio.com/")) return; // don't cache audio
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    try{
      const fresh = await fetch(req);
      if (fresh && fresh.ok && req.method === "GET") cache.put(req, fresh.clone());
      return fresh;
    } catch(e){
      return cached || new Response("Offline", {status: 200, headers: {"Content-Type":"text/plain; charset=utf-8"}});
    }
  })());
});
