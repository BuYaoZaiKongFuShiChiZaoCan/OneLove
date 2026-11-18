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
  event.waitUntil((async () => {
    await self.clients.claim();
    /**
     * v1 的音视频桶里可能存着半截文件（见下面 MEDIA_CACHE 的注释），
     * 升级后直接删掉，别让「第一次能播、第二次自动跳」的旧条目继续生效。
     */
    for (const old of ['ql:media-v1', 'ql:media-video-v1']) {
      try { await caches.delete(old); } catch (e) { }
    }
  })());
});
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ============ 音频 / 视频缓存 ============
/**
 * 2026-11-17 缓存桶升到 v2：
 * v1 里可能存着**不完整**的文件（旧写法是后台 `fetch(key)` 另下一整份再 cache.put，
 * 用户在下载途中切歌/关页面时，这条流会被打断，Chromium 有可能把半截内容落盘）。
 * 下次播放命中这种条目，切片出来的 Content-Range 说有一整首、实际字节数不够，
 * 播放器解到一半就 error → 自动跳下一首，正好是「第一次能播、第二次自动跳」。
 * 换桶名等于把这些可疑条目一次性丢掉（缓存本来就是可丢的），不用逐条校验。
 */
const MEDIA_CACHE = 'ql:media-v2';
const VIDEO_CACHE = 'ql:media-video-v2';
/** 最多缓存多少首。平均一首 3-6MB，120 首约 400-700MB。
 *  再多会逼近浏览器给本站的配额，Chrome 在磁盘紧张时会**整个源一起清空**，反而全丢。 */
const MEDIA_MAX = 120;
/** MV 单独一个桶，别把 mp3 挤出去。线上 16 个 MV 合计 214MB、最大 23.8MB，
 *  留 6 个大约 80MB 封顶，加上 mp3 也还在安全区。 */
const VIDEO_MAX = 6;
/** 体积安全阀：超过就不进缓存（线上 MV 已全部 ≤25MiB，只是防止以后塞大文件进来） */
const VIDEO_MAX_BYTES = 30 * 1024 * 1024;

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
      /**
       * 切片失败**不能**把整份 200 丢给一个 Range 请求：
       * 播放器会以为「服务器不支持 Range」，而且拿到的字节和它请求的区间对不上，
       * 表现就是这首怎么都起不来。缓存条目不可用就删掉，走网络（CF 会回整份 200，正常播）。
       */
      try { await cache.delete(key); } catch (e) { }
      return fetch(request);
    }
  }

  const res = await fetch(request);

  /**
   * 后台补缓存。两种来源，区别很大：
   *
   * ① res.status === 200：服务器**不认 Range**，这次已经把整份给了播放器（Cloudflare Pages 就是这样，
   *    任何 Range 请求都回 200 整份）。那就把这份 body 复制一份存起来 —— 零额外流量。
   *    ⚠️ 旧写法在这里又 `fetch(key)` 下一整份，等于同一首歌每次首播都下两遍：
   *    慢网下播放器拿到的带宽被砍半，首播迟迟起不来，是很直接的「加载几秒就跳」诱因之一。
   *
   * ② res.status === 206：服务器支持 Range（Netlify 是这样），这次只回了片段，
   *    想支持拖动就得另外补一份完整的，这时才真的需要再下一遍。
   *
   * 写入前先把 body 完整读成 Blob 再 put：中途被打断（用户切歌/关页面）时 blob() 会失败，
   * 于是**不会**留下半截缓存 —— 半截条目正是「第一次能播、第二次自动跳」的来源。
   */
  const job = (async () => {
    if (inflight.has(key.url)) return;
    inflight.add(key.url);
    try {
      if (res.status === 200) {
        const len = Number(res.headers.get('content-length') || 0);
        if (cacheName === VIDEO_CACHE && len > VIDEO_MAX_BYTES) return;
        const blob = await res.clone().blob();   // 完整拿到才继续；被中断会抛
        if (!blob || !blob.size) return;
        const headers = new Headers(res.headers);
        // 已经是解码后的字节，别把原来的 content-encoding 带给缓存
        headers.delete('content-encoding');
        headers.delete('transfer-encoding');
        headers.set('content-length', String(blob.size));
        await cache.put(key, new Response(blob, { status: 200, statusText: 'OK', headers }));
        await trimCache(cacheName, max);
      } else {
        const full = await fetch(key); // 206：无 Range 再取一次整份
        if (!full || full.status !== 200) return;
        if (cacheName === VIDEO_CACHE) {
          const len = Number(full.headers.get('content-length') || 0);
          if (len > VIDEO_MAX_BYTES) return;
        }
        const blob = await full.blob();
        if (!blob || !blob.size) return;
        const headers = new Headers(full.headers);
        headers.delete('content-encoding');
        headers.delete('transfer-encoding');
        headers.set('content-length', String(blob.size));
        await cache.put(key, new Response(blob, { status: 200, statusText: 'OK', headers }));
        await trimCache(cacheName, max);
      }
    } catch (err) {
      // 网络问题 / 下载中途被打断：什么都不存，下次播放再试
    } finally {
      inflight.delete(key.url);
    }
  })();
  if (event && typeof event.waitUntil === 'function') event.waitUntil(job);

  return res;
}

/**
 * 只接管**播放器发出的**音视频请求：destination 是 audio / video。
 *
 * ⚠️ 2026-11-17 改动：原来还按 URL 兜底匹配 /music/*.mp3，结果 scripts/id3.js 里
 * 「只读文件头拿封面/歌词」的那次普通 fetch（destination 为空）也被接管了，
 * 而旧版接管后会在后台额外下一整份 —— 每切一首歌就白白多下一次 4MB 左右，
 * 慢网下把带宽吃光，后面的歌迟迟缓冲不出来，看着就像「加载几秒自动跳」。
 */
workbox.routing.registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin &&
    (request.destination === 'audio' || request.destination === 'video'),
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
