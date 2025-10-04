self.addEventListener('error', function (e) {
  self.clients.matchAll().then(function (clients) {
    if (clients && clients.length) {
      clients[0].postMessage({
        type: 'ERROR',
        msg: e.message || null,
        stack: e.error ? e.error.stack : null,
      });
    }
  });
});

self.addEventListener('unhandledrejection', function (e) {
  self.clients.matchAll().then(function (clients) {
    if (clients && clients.length) {
      clients[0].postMessage({
        type: 'REJECTION',
        msg: e.reason ? e.reason.message : null,
        stack: e.reason ? e.reason.stack : null,
      });
    }
  });
});

importScripts('https://g.alicdn.com/kg/workbox/3.3.0/workbox-sw.js');
workbox.setConfig({
  debug: false,
  modulePathPrefix: 'https://g.alicdn.com/kg/workbox/3.3.0/',
});
workbox.skipWaiting();
workbox.clientsClaim();

// 处理安装事件
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 处理激活事件
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 处理消息事件，用于与主线程通信
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

var cacheList = ['/', '/index.html'];

workbox.routing.registerRoute(
  new RegExp(/\.(?:html|css)$/),
  workbox.strategies.networkFirst({
    cacheName: 'ql:html',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 10,
      }),
    ],
  }),
);

workbox.routing.registerRoute(
  new RegExp(/\.(?:js|css)$/),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'ql:static',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 20,
      }),
    ],
  }),
);

workbox.routing.registerRoute(
  new RegExp(/\.(?:png|gif|jpg|jpeg|webp|svg|cur)$/),
  workbox.strategies.cacheFirst({
    cacheName: 'ql:img',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.Plugin({
        maxEntries: 20,
        maxAgeSeconds: 12 * 60 * 60,
      }),
    ],
  }),
);