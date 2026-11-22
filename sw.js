/* Increment CACHE_NAME when the cached app shell or cache policy changes. */
const CACHE_NAME = "quizvilla-shell-v1";
const CACHE_PREFIX = "quizvilla-shell-";
const APP_SCOPE = new URL("./", self.registration.scope);
const OFFLINE_URL = new URL("offline.html", APP_SCOPE).href;

const PRECACHE_PATHS = [
  "index.html",
  "offline.html",
  "manifest.json",
  "styles/design-system.css",
  "styles/pwa.css",
  "styles/theme.css",
  "styles/theme.js",
  "scripts/pwa.js",
  "scripts/pwa-install.js",
  "homepage/home.html",
  "homepage/home.css",
  "homepage/home.js",
  "RegisterPage/register.html",
  "RegisterPage/register.css",
  "RegisterPage/register.js",
  "Quizpage/quiz.html",
  "Quizpage/quiz.css",
  "Quizpage/quiz.js",
  "StorePage/store.html",
  "StorePage/store.css",
  "StorePage/store.js",
  "SettingsPage/setting.html",
  "SettingsPage/setting.css",
  "SettingsPage/setting.js",
  "EditPage/edit.html",
  "EditPage/edit.css",
  "EditPage/edit.js",
  "Avatar/avatar.html",
  "Avatar/avatar.css",
  "Avatar/avatar.js",
  "photoCapture/camera.html",
  "photoCapture/camera.css",
  "photoCapture/camera.js",
  "LoadingPage/load.css",
  "LoadingPage/load.js",
  "adLinks.json",
  "praise.json",
  "images/idea.png",
  "images/pwa-192.png",
  "images/pwa-512.png",
  "images/pwa-maskable-512.png",
  "images/apple-touch-icon.png",
  "images/left.png",
  "images/home (1).png",
  "images/user.png",
  "images/user (5).png",
  "images/user (8).png",
  "images/coin.png",
  "images/heart.png",
  "images/add.png",
  "images/arrow-up.png",
  "images/clock.png",
  "images/settings.png",
  "images/share.png",
  "images/grocery-store.png",
  "images/camera.png",
  "images/hint.png",
  "images/50-percent.png",
  "images/flash.png",
  "images/alarm-clock.png",
  "sounds/buttonClick.mp3",
  "sounds/hit.wav",
  "sounds/correct.mp3",
  "sounds/fail.wav",
  "sounds/failedGameSound.mp3",
  "sounds/jubilation.mp3",
  "sounds/coinPurchase.wav",
  "sounds/datsIncorrect.wav",
  "sounds/datsWrong.wav",
  "sounds/firstClick.wav"
];

function toAppUrl(path) {
  return new URL(path, APP_SCOPE).href;
}

function isCacheableStaticRequest(request, url) {
  if (request.method !== "GET" || request.headers.has("range")) return false;
  if (request.headers.has("authorization")) return false;
  if (url.origin !== APP_SCOPE.origin || !url.pathname.startsWith(APP_SCOPE.pathname)) return false;
  if (url.pathname.endsWith(".json")) {
    return ["adLinks.json", "praise.json", "manifest.json"].some((path) => url.pathname === toAppUrl(path).replace(APP_SCOPE.origin, ""));
  }
  return /\.(?:html|css|js|png|jpe?g|jfif|gif|svg|ico|webp|mp3|wav)$/i.test(url.pathname);
}

async function storeIfSmall(cache, request, response) {
  if (!response || response.status !== 200 || response.type === "opaque" || response.type === "opaqueredirect") return response;
  const finalUrl = response.url ? new URL(response.url) : null;
  if (finalUrl && (finalUrl.origin !== APP_SCOPE.origin || !finalUrl.pathname.startsWith(APP_SCOPE.pathname))) return response;
  if (response.headers.get("cache-control")?.includes("no-store")) return response;
  const byteLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(byteLength) && byteLength > 1024 * 1024) return response;
  try { await cache.put(request, response.clone()); }
  catch (_) { /* A full cache must not prevent a successful network response. */ }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const urls = PRECACHE_PATHS.map(toAppUrl);
    await cache.addAll(urls);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== APP_SCOPE.origin || !url.pathname.startsWith(APP_SCOPE.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await storeIfSmall(cache, request, response);
        }
        return response;
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request, { ignoreSearch: true })) ||
          (await cache.match(OFFLINE_URL)) ||
          new Response("QuizVilla is offline. Reconnect and try again.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  if (!isCacheableStaticRequest(request, url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      return await storeIfSmall(cache, request, response);
    } catch (_) {
      if (/\.(?:png|jpe?g|jfif|gif|svg|ico|webp)$/i.test(url.pathname)) {
        const fallback = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0b1220"/><circle cx="32" cy="32" r="17" fill="none" stroke="#d6ad60" stroke-width="3"/><path d="M24 35h16m-14 5h12" stroke="#f0ca7a" stroke-width="3" stroke-linecap="round"/></svg>';
        return new Response(fallback, { status: 200, headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" } });
      }
      return new Response("This QuizVilla asset is not available offline.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});
