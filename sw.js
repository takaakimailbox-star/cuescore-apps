const APP_VERSION = "1.0-unified-result-detail-v1";
const CACHE_NAME = `cuescore-rotation-v${APP_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/favicon.ico",
  "./icons/favicon-16.png",
  "./icons/favicon-32.png",
  "./icons/favicon-48.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./assets/icons/navigation/cuescore-mark-black.svg",
  "./assets/icons/navigation/nav-home.svg",
  "./assets/icons/navigation/nav-player.svg",
  "./assets/icons/navigation/nav-history.svg",
  "./assets/icons/navigation/nav-analytics.svg",
  "./assets/icons/navigation/nav-settings.svg",
  "./assets/icons/games/game-rotation.svg",
  "./assets/icons/games/game-9ball.svg",
  "./assets/icons/games/game-10ball.svg",
  "./assets/icons/games/game-14-1.svg",
  "./assets/icons/games/game-jpa-9ball.svg",
  "./assets/icons/games/game-3cushion.svg",
  "./assets/icons/avatar/manifest.json",
  "./assets/icons/avatar/default/avatar_default_silhouette.png"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    const response = await fetch("./assets/icons/avatar/manifest.json", {cache:"no-store"});
    if (!response.ok) throw new Error("Avatar manifest could not be loaded");
    const manifest = await response.json();
    const presetPaths = (manifest.presets || []).map(item => `./${item.src}`);
    await cache.addAll(presetPaths);
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach(client => client.postMessage({
      type: "CUESCORE_VERSION_READY",
      version: APP_VERSION
    }));
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "GET_VERSION") {
    event.ports?.[0]?.postMessage({ version: APP_VERSION });
    return;
  }
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put("./index.html", response.clone());
        return response;
      } catch (_) {
        return (await caches.match(event.request)) || (await caches.match("./index.html"));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, response.clone());
    }
    return response;
  })());
});
