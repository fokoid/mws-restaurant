const CACHE_VERSION = 63;
const CACHE_PREFIX = 'restaurant-reviews-';
const CACHE_NAME = `${CACHE_PREFIX}v${CACHE_VERSION}`;
const IMG_CACHE_NAME = `${CACHE_PREFIX}images`;
const URL_LIST = [
  '/',
  '/restaurant.html',
  '/js/indexController.js',
  '/js/restaurantInfoController.js',
  '/js/idb.js',
  '/js/dbhelper.js',
  '/js/restaurant.js',
  '/js/review.js',
  '/js/warning.js',
  '/css/styles.css',
  '/manifest.json',
  '/icon/app-16.png',
  '/icon/app-32.png',
  '/icon/app-96.png',
  '/icon/app-192.png',
  '/icon/app-512.png',
  '/icon/heart.svg',
  '/icon/heart-filled.svg',
  '/icon/x-circle.svg',
  '/icon/alert-triangle.svg',
  '/icon/edit.svg',
  '/icon/trash-2.svg',
  '/icon/star.svg',
  '/icon/star-filled.svg',
  '/favicon.ico',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png'
];

self.addEventListener('install', event => void event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  try {
    return await cache.addAll(URL_LIST);
  } catch (err) {
    console.err(err);
  }
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
    try {
      return await cache.match('/restaurant.html');
    } catch (err) {
      console.log(err);
    }
  }
  const match = await caches.match(event.request);
  if (match) return match;
  try {
    return await fetch(event.request);
  } catch (err) {
    console.log('[sw] Fetch failed:', err);
  }
})()));

const fetchImg = async request => {
  // create standardized URL, with filetype and size removed
  const url = (new URL(request.url)).pathname.replace(/-\d+\.(jpg|webp)$/, '');

  const imgCache = await caches.open(IMG_CACHE_NAME);
  let response = await imgCache.match(url);
  if (!response) {
    try {
      response = await fetch(request);
      if (response.status === 200)
        imgCache.put(url, response.clone());
    } catch (err) {
      console.log('[sw.js] Fetch failed:', err);
    }
  }
  return response;
};
