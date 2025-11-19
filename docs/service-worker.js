const CACHE_NAME = 'seu-app-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './icons/icon-192x192.png'
  // Adicione todos os outros arquivos estáticos aqui
];

// Evento 'install': Armazena os arquivos em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': Intercepta requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna do cache
        if (response) {
          return response;
        }
        // Se não, busca na rede
        return fetch(event.request);
      }
    )
  );
});
