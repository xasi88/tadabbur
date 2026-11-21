// Работа без интернета. Кэш с префиксом проекта: на xasi88.github.io общее хранилище.
// Новая версия файлов: поменять VERSION.
const VERSION = "tadabbur-0.1.0";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "icons/icon.svg",
  "css/app.css", "css/tokens.css",
  "js/app.js", "js/srs.js", "js/store.js", "js/arabic.js", "js/version.js", "js/cloud.js", "js/merge.js",
  "fonts/manrope.woff2", "fonts/unbounded.woff2", "fonts/hafs.woff2",
  "data/app/words.json", "data/app/fatiha.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "no-cache" })))));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith("tadabbur-") && k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Свои файлы: сначала кэш. Звук слов с audio.qurancdn.com: сеть, потом кэш.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
  } else if (url.hostname === "audio.qurancdn.com") {
    e.respondWith(caches.open(VERSION).then((c) => fetch(e.request).then((r) => { c.put(e.request, r.clone()); return r; })
      .catch(() => c.match(e.request))));
  }
});
