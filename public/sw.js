const CACHE_VERSION = 9;
const CACHE_PREFIX = 'restaurant-reviews';
const CACHE_NAME = `${CACHE_PREFIX}-v${CACHE_VERSION}`;
const IMG_CACHE_NAME = `${CACHE_PREFIX}-images`;

const URL_LIST = [
  '/',
  '/restaurant.html',
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
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/img/'))
    return fetchImg(event.request);
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
