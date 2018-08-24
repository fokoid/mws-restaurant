const CACHE_VERSION = 9;
const CACHE_PREFIX = 'restaurant-reviews';
const CACHE_NAME = `${CACHE_PREFIX}-v${CACHE_VERSION}`;
const DB_PORT = '1337';

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

  if (url.port === DB_PORT)
    return fetchDB(event.request);
  if (url.pathname.startsWith('/img/'))
    return fetchImg(event.request);
  return await caches.match(event.request) || await fetch(event.request);
})()));

const fetchDB = async request => {
  return fetch(request);
};

const fetchImg = async request => {
  return fetch(request);
};
