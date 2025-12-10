const CACHE_NAME = 'salary-calculator-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  'img/money-bag.svg',
  'img/piggy-bank.svg',
  'img/earnings.svg',
  'img/briefcase.svg',
  'img/weather-few-clouds-night.svg',
  'img/money.svg',
  'img/milk-carton.svg',
  'img/hazard.svg',
  'img/tax.svg',
  'img/dialog-error.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});