const CACHE_VERSION = 26;
const CACHE_PREFIX = 'restaurant-reviews-';
const CACHE_NAME = `${CACHE_PREFIX}v${CACHE_VERSION}`;
const IMG_CACHE_NAME = `${CACHE_PREFIX}images`;
const URL_LIST = [
  '/',
  '/restaurant.html',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/shared.js',
  '/js/dbhelper.js',
  '/js/idb.js',
  '/css/styles.css',
  '/manifest.json'
];

self.addEventListener('install', event => void event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  return await cache.addAll(URL_LIST);
})()));

self.addEventListener('activate', event => void event.waitUntil((async() => {
  const cacheNames = await caches.keys();
  const liveCacheNames = [CACHE_NAME, IMG_CACHE_NAME];
  const deadCacheNames = cacheNames.
    filter(cacheName => cacheName.startsWith(CACHE_PREFIX)).
    filter(cacheName => !liveCacheNames.includes(cacheName));
  return await Promise.all(deadCacheNames.map(cacheName => caches.delete(cacheName)));
})()));

self.addEventListener('fetch', event => void event.respondWith((async () => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/img/'))
    return fetchImg(event.request);
  if (url.pathname.startsWith('/restaurant.html')) {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match('/restaurant.html');
  }
  return await caches.match(event.request) || await fetch(event.request);
})()));

const fetchImg = async request => {
  // create standardized URL, with filetype and size removed
  const url = (new URL(request.url)).pathname.replace(/-\d+\.(jpg|webp)$/, '');

  const imgCache = await caches.open(IMG_CACHE_NAME);
  let response = await imgCache.match(url);
  if (!response) {
    response = await fetch(request);
    if (response.status === 200)
      imgCache.put(url, response.clone());
  }
  return response;
};
