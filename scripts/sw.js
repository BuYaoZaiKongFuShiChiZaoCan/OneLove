/**
 * Service Worker
 *
 * 2026-10-29 重写：
 * 1) 原来这个 SW 其实**从来没有注册成功过**（线上 navigator.serviceWorker.getRegistrations() 返回空），
 *    所以下面那三条缓存路由一条都没生效过。根因是 register("./scripts/sw.js") 没带 scope，
 *    默认作用域只有 /scripts/，再叠加从 alicdn 拉的 workbox 3.3.0 加载失败，直接装不上。
 *    现在：注册时显式 scope "/"（配合 netlify.toml 里的 Service-Worker-Allowed 头），
 *    workbox 换成 7.1.0 并**放在仓库本地**（/scripts/wb/），不再依赖任何外网 CDN。
 * 2) 新增音频本地缓存，支持 Range 请求（拖动进度条）。
 *
 * 为什么音频要单独写 handler：
 *   <audio> 发的是 Range 请求，服务器回 206。Cache API **拒绝存 206**
 *   （cache.put 会抛 "Partial response (status code 206) is unsupported"），
 *   所以不能"拦截下来原样存一份"。这里改成：
 *     - 未命中 → 这次照常走网络（起播速度和以前一样，不额外等），
 *                同时在后台**不带 Range**地拉一份完整文件存进缓存；
 *     - 已命中 → 用 workbox 的 createPartialResponse 把缓存的完整文件按 Range 切片回 206。
 * 2026-11-11 迁移到 Cloudflare Pages 后补上 MV：
 *   Pages **完全不支持 Range 请求**（实测任何 Range 都回 200 整份，没有 Accept-Ranges），
 *   而 Netlify 以前是原生支持的 —— 不补的话 MV 拖动进度条会直接失效。
 *   所以 mp4 也走同一套「后台存整份 + 命中后切片回 206」的机制，只是单独一个缓存桶。
 *   注意 MV 的"下次打开不用加载"本来就由 _headers 里的 30 天 HTTP 缓存负责，
 *   这里的 SW 缓存是为了**能拖进度条**，不是为了让第二次更快。
 *   代价：首次播放会在后台多拉一整份（最多 23.8MB），所以只留最近 6 个。
 */

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

// workbox 7.1.0 —— 全部是仓库里的本地文件，不碰 GCS / alicdn。
// 这里**不用** workbox-sw.js 的懒加载：它按需 importScripts 模块，实测会先加载
// workbox-range-requests 再去加载它依赖的 workbox.core，直接抛
// "The script at .../workbox-range-requests.prod.js failed to load"，
// 导致 createPartialResponse 永远不可用。改成按依赖顺序显式加载，稳定可预期。
importScripts(
  '/scripts/wb/workbox-core.prod.js',
  '/scripts/wb/workbox-routing.prod.js',
  '/scripts/wb/workbox-cacheable-response.prod.js',
  '/scripts/wb/workbox-expiration.prod.js',
  '/scripts/wb/workbox-strategies.prod.js',
  '/scripts/wb/workbox-range-requests.prod.js'
);

// 注意：workbox 5 以后 skipWaiting/clientsClaim 挪到了 workbox.core 下面，
// 顶层没有 workbox.skipWaiting() 这个函数（写成顶层会直接让整个 SW 评估失败，
// 报 "workbox.skipWaiting is not a function"）。这里用下面两个原生事件即可。
self.addEventListener('install', function () {
  self.skipWaiting();
});
self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ============ 音频 / 视频缓存 ============
const MEDIA_CACHE = 'ql:media-v1';
const VIDEO_CACHE = 'ql:media-video-v1';
/** 最多缓存多少首。平均一首 3-6MB，120 首约 400-700MB。
 *  再多会逼近浏览器给本站的配额，Chrome 在磁盘紧张时会**整个源一起清空**，反而全丢。 */
const MEDIA_MAX = 120;
/** MV 单独一个桶，别把 mp3 挤出去。线上 16 个 MV 合计 214MB、最大 23.8MB，
 *  留 6 个大约 80MB 封顶，加上 mp3 也还在安全区。 */
const VIDEO_MAX = 6;
/** 体积安全阀：超过就不进缓存（线上 MV 已全部 ≤25MiB，只是防止以后塞大文件进来） */
const VIDEO_MAX_BYTES = 30 * 1024 * 1024;
const MEDIA_PATH = /\/music\/(?:mv\/)?[^/]+\.(?:mp3|mp4)$/i;

async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const over = keys.length - max;
  // cache.keys() 按插入顺序返回，直接从头删就是最旧的先走
  for (let i = 0; i < over; i++) await cache.delete(keys[i]);
}

/** 同一首歌/同一个 MV 的后台补全只跑一份，避免拖动进度条时连着触发好几次整份下载 */
const inflight = new Set();

async function mediaHandler({ request, event }) {
  const url = new URL(request.url);
  const cacheName = /\.mp4$/i.test(url.pathname) ? VIDEO_CACHE : MEDIA_CACHE;
  const max = cacheName === VIDEO_CACHE ? VIDEO_MAX : MEDIA_MAX;
  const cache = await caches.open(cacheName);
  const key = new Request(request.url, { method: 'GET' }); // 不带 Range 的稳定 key

  const hit = await cache.match(key);
  if (hit) {
    const range = request.headers.get('range');
    if (!range) return hit;
    try {
      return await workbox.rangeRequests.createPartialResponse(request, hit);
    } catch (err) {
      // Range 头解析不了就整份给，播放器照样能播
      return hit;
    }
  }

  const res = await fetch(request);

  // 后台补一份完整文件；不阻塞这次播放（所以首次播放 MV 还是不能拖，第二次起可以）
  const job = (async () => {
    if (inflight.has(key.url)) return;
    inflight.add(key.url);
    try {
      const full = await fetch(key); // 无 Range → 200 整份
      if (!full || full.status !== 200) return;
      if (cacheName === VIDEO_CACHE) {
        const len = Number(full.headers.get('content-length') || 0);
        if (len > VIDEO_MAX_BYTES) return;
      }
      await cache.put(key, full);
      await trimCache(cacheName, max);
    } catch (err) {
      // 网络问题就算了，下次播放再试
    } finally {
      inflight.delete(key.url);
    }
  })();
  if (event && typeof event.waitUntil === 'function') event.waitUntil(job);

  return res;
}

// 只接管本站的音频/视频：MV 里有些条目是抖音外链，跨域 opaque 响应存进 Cache 会失败
workbox.routing.registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin &&
    (request.destination === 'audio' || request.destination === 'video' || MEDIA_PATH.test(url.pathname)),
  mediaHandler
);

// ============ 以下三条保持原有策略，只是换成 workbox 7 的 API ============
workbox.routing.registerRoute(
  /\.(?:html|css)$/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'ql:html',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 10 })],
  })
);

workbox.routing.registerRoute(
  /\.(?:js|css)$/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'ql:static-v2',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 20 })],
  })
);

workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|webp|svg|cur)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'ql:img',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
      new workbox.expiration.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 12 * 60 * 60 }),
    ],
  })
);
