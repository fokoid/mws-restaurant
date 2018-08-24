const CACHE_VERSION = 7;
const CACHE_PREFIX = 'restaurant-reviews';
const CACHE_NAME = `${CACHE_PREFIX}-v${CACHE_VERSION}`;
const URL_LIST = [
  '/',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/shared.js',
  '/js/dbhelper.js',
  '/css/styles.css',
  '/manifest.json'
];

self.addEventListener('install', event => void event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(URL_LIST);
})()));

self.addEventListener('fetch', event => void event.respondWith((async () => {
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(event.request, {
    ignoreSearch: true
  });
  if (!response) {
    try {
      response = await fetch(event.request);
    } catch (err) {
      console.log(err);
    }
    if (response.status === 200)
      cache.put(event.request, response.clone());
  }
  return response;
})()));
