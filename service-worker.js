const CACHE_NAME = "stick-war-pwa-v112";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=20260613-ai-build-lock",
  "./game.js?v=20260613-ai-build-lock",
  "./manifest.webmanifest?v=20260613-ai-build-lock",
  "./assets/icon.svg",
  "./assets/title/medieval-stick-title.png",
  "./assets/factions/order-crest.png",
  "./assets/factions/chaos-crest.png",
  "./assets/factions/undead-crest.png",
  "./assets/factions/element-crest.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  const url = new URL(event.request.url);
  const isFreshCodeAsset = url.pathname.endsWith("/game.js") || url.pathname.endsWith("/style.css");
  if (isFreshCodeAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
