[sw.js](https://github.com/user-attachments/files/33060147/sw.js)
const CACHE = 'doses-emergencia-v3';
const ARQUIVOS = [
  './','./index.html','./dados.js','./manifest.json',
  './icon-192.png','./icon-512.png','./apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(n => Promise.all(n.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

// cache primeiro: o app precisa abrir mesmo sem sinal
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(net => {
    const copia = net.clone();
    caches.open(CACHE).then(c => c.put(e.request, copia));
    return net;
  }).catch(() => caches.match('./index.html'))));
});
