const CACHE_NAME = 'salary-calculator-v4'
const BASE_PATH = self.location.pathname.includes('github.io')
  ? '/' + self.location.pathname.split('/')[1] + '/'
  : '/'

// Ключевые файлы для кэширования
const CORE_FILES = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'app.js',
  BASE_PATH + 'style.css',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'icon-32x32.png',
  BASE_PATH + 'icon-48x48.png',
  BASE_PATH + 'icon-72x72.png',
  BASE_PATH + 'icon-96x96.png',
  BASE_PATH + 'icon-144x144.png',
  BASE_PATH + 'icon-152x152.png',
  BASE_PATH + 'icon-180x180.png',
  BASE_PATH + 'icon-192x192.png',
  BASE_PATH + 'icon-512x512.png',
  BASE_PATH + 'img/dialog-error.svg',
  BASE_PATH + 'img/earnings.svg',
  BASE_PATH + 'img/briefcase.svg',
  BASE_PATH + 'img/weather-few-clouds-night.svg',
  BASE_PATH + 'img/money.svg',
  BASE_PATH + 'img/milk-carton.svg',
  BASE_PATH + 'img/hazard.svg',
  BASE_PATH + 'img/tax.svg',
  BASE_PATH + 'img/money-bag.svg',
  BASE_PATH + 'img/piggy-bank.svg',
]

// Файлы для стратегии Network First (данные и API)
const NETWORK_FIRST_FILES = [
  // Можно добавить API endpoints если будут
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Установка и кэширование файлов')
        // Кэшируем только критические файлы
        return cache.addAll(
          CORE_FILES.map(url => {
            try {
              return new Request(url, { cache: 'reload' })
            } catch (error) {
              console.warn('[SW] Ошибка создания Request для:', url, error)
              return url
            }
          })
        )
      })
      .then(() => {
        // Активируем SW сразу
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Ошибка установки:', error)
      })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Удаляем старые версии кэша
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Удаление старого кэша:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        // Берем управление всеми клиентами
        return self.clients.claim()
      })
  )
})

self.addEventListener('fetch', event => {
  const { request } = event

  // Пропускаем не-GET запросы
  if (request.method !== 'GET') return

  // Пропускаем chrome-extension и другие неподдерживаемые схемы
  if (!request.url.startsWith('http')) return

  const url = new URL(request.url)

  // Для файлов данных используем Network First
  if (NETWORK_FIRST_FILES.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Для всего остального - Cache First с fallback на сеть
  event.respondWith(cacheFirstStrategy(request))
})

// Стратегия: Сначала кэш, потом сеть
function cacheFirstStrategy(request) {
  return caches.match(request, { ignoreSearch: true }).then(response => {
    // Возвращаем из кэша если есть
    if (response) {
      console.log('[SW] Из кэша:', request.url)
      return response
    }

    // Иначе грузим из сети
    return fetch(request)
      .then(networkResponse => {
        // Кэшируем только успешные ответы
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone()
          caches
            .open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseClone)
            })
            .catch(error => {
              console.warn('[SW] Ошибка кэширования:', request.url, error)
            })
        }
        return networkResponse
      })
      .catch(error => {
        console.log('[SW] Ошибка сети для:', request.url, error)

        // Для навигационных запросов возвращаем кэшированную страницу
        if (request.mode === 'navigate') {
          return caches.match(BASE_PATH + 'index.html')
        }

        // Для изображений можно вернуть placeholder
        if (request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" fill="#ccc">No Image</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          )
        }

        // Для остальных - возвращаем ошибку
        return new Response('Нет соединения', {
          status: 503,
          statusText: 'Нет соединения с интернетом',
          headers: { 'Content-Type': 'text/plain' },
        })
      })
  })
}

// Стратегия: Сначала сеть, потом кэш
function networkFirstStrategy(request) {
  return fetch(request)
    .then(networkResponse => {
      // Обновляем кэш
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone)
        })
      }
      return networkResponse
    })
    .catch(() => {
      // Если сеть недоступна - пробуем из кэша
      return caches.match(request, { ignoreSearch: true })
    })
}

// Фоновое обновление кэша
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    console.log('[SW] Получена команда на обновление кэша')

    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(CORE_FILES)
      })
      .then(() => {
        event.ports[0].postMessage({ status: 'CACHE_UPDATED' })
      })
      .catch(error => {
        console.error('[SW] Ошибка обновления кэша:', error)
        event.ports[0].postMessage({ status: 'CACHE_UPDATE_FAILED', error: error.message })
      })
  }
})

// Периодическая синхронизация (если поддерживается)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-cache') {
      event.waitUntil(updateCache())
    }
  })
}

async function updateCache() {
  const cache = await caches.open(CACHE_NAME)

  for (const url of CORE_FILES) {
    try {
      const response = await fetch(url, { cache: 'reload' })
      if (response.ok) {
        await cache.put(url, response)
      }
    } catch (error) {
      console.warn('[SW] Не удалось обновить:', url, error)
    }
  }
}

// Обработка ошибок
self.addEventListener('error', error => {
  console.error('[SW] Ошибка:', error)
})
