const CACHE_NAME = 'salary-calculator-v1'
const APP_PREFIX = 'salary-calculator'

// Определяем путь для GitHub Pages
function getBasePath() {
  // Если на GitHub Pages
  if (self.location.hostname.includes('github.io')) {
    // Получаем имя репозитория из URL
    const path = self.location.pathname
    const parts = path.split('/')

    // Если путь содержит имя репозитория (например: /salary-calculator/)
    if (parts.length > 2 && parts[1] === APP_PREFIX) {
      return '/' + APP_PREFIX + '/'
    } else if (parts.length > 2) {
      // Другой репозиторий
      return '/' + parts[1] + '/'
    }
  }
  return '/'
}

const BASE_PATH = getBasePath()

console.log('[SW] Base path:', BASE_PATH)

// Файлы для кэширования (используем относительные пути)
const CORE_FILES = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon-32x32.png',
  './icon-48x48.png',
  './icon-72x72.png',
  './icon-96x96.png',
  './icon-144x144.png',
  './icon-152x152.png',
  './icon-180x180.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './img/dialog-error.svg',
  './img/earnings.svg',
  './img/briefcase.svg',
  './img/weather-few-clouds-night.svg',
  './img/money.svg',
  './img/milk-carton.svg',
  './img/hazard.svg',
  './img/tax.svg',
  './img/money-bag.svg',
  './img/piggy-bank.svg',
  './img/overtime.svg',
  './img/work.svg',
  './img/night.svg',
  './img/gift.svg',
  './img/house-with-garden.svg',
]

// Преобразуем относительные пути в абсолютные для GitHub Pages
const getFullPath = path => {
  if (path.startsWith('./')) {
    return BASE_PATH + path.substring(2)
  }
  return BASE_PATH + path
}

const CORE_FILES_FULL = CORE_FILES.map(getFullPath)

console.log('[SW] Files to cache:', CORE_FILES_FULL)

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Кэширование файлов...')
        // Кэшируем только основные файлы
        return Promise.all(
          CORE_FILES_FULL.map(url => {
            return cache.add(url).catch(error => {
              console.warn('[SW] Не удалось кэшировать:', url, error)
            })
          })
        )
      })
      .then(() => {
        console.log('[SW] Установка завершена')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Ошибка установки:', error)
      })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Удаление старого кэша:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Берем управление клиентами
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', event => {
  const request = event.request

  // Пропускаем не-GET запросы и неподдерживаемые схемы
  if (request.method !== 'GET' || !request.url.startsWith('http')) return

  const requestUrl = new URL(request.url)

  // Игнорируем запросы к аналитике и внешним ресурсам
  if (
    requestUrl.hostname.includes('yandex.ru') ||
    requestUrl.hostname.includes('mc.yandex.ru') ||
    requestUrl.hostname.includes('google-analytics')
  ) {
    return
  }

  event.respondWith(
    caches.match(request).then(response => {
      // Возвращаем из кэша если есть
      if (response) {
        return response
      }

      // Иначе грузим из сети
      return fetch(request)
        .then(networkResponse => {
          // Кэшируем только успешные ответы
          if (networkResponse.ok && networkResponse.status === 200) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Fallback для навигационных запросов
          if (request.mode === 'navigate') {
            return caches.match(BASE_PATH + 'index.html')
          }
          return new Response('Офлайн', {
            status: 503,
            statusText: 'Нет соединения',
            headers: { 'Content-Type': 'text/plain' },
          })
        })
    })
  )
})
