const CACHE_NAME = 'restaurant-reviews-v1';
const URL_LIST = [
  '/',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/shared.js',
  '/js/dbhelper.js',
  '/css/styles.css'
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
    cache.put(event.request, response.clone());
  }
  return response;
})()));
