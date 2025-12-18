const CACHE_NAME = 'salary-calculator-v3';
const BASE_PATH = self.location.pathname.includes('github.io') ? 
    (() => {
        const path = self.location.pathname;
        const parts = path.split('/');
        return parts.length > 2 ? '/' + parts[1] + '/' : '/';
    })() : '/';

const urlsToCache = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'app.js',
    BASE_PATH + 'style.css',
    BASE_PATH + 'manifest.json',
    BASE_PATH + 'icon-192x192.png',
    BASE_PATH + 'icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Кэширование файлов:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Ошибка кэширования:', error);
            })
    );
});

self.addEventListener('fetch', event => {
    // Игнорируем запросы, которые не являются GET
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Возвращаем из кэша если есть
                if (response) {
                    return response;
                }
                
                // Иначе загружаем из сети
                return fetch(event.request)
                    .then(response => {
                        // Проверяем валидный ли ответ
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Клонируем ответ
                        const responseToCache = response.clone();
                        
                        // Добавляем в кэш
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Если нет сети и нет в кэше - можно вернуть fallback
                        if (event.request.mode === 'navigate') {
                            return caches.match(BASE_PATH + 'index.html');
                        }
                    });
            })
    );
});

// Очистка старых кэшей
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

});
