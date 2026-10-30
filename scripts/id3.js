/**
 * id3.js —— 从 mp3 文件头的 ID3v2 标签里读封面(APIC)与歌词(USLT)
 *
 * 为什么需要它：
 *   音频元素只解码音频流，浏览器不会把 mp3 里的封面/歌词交给 JS，
 *   所以只能自己用 Range 请求取文件头这一小段，再按 ID3v2 规范拆帧。
 *
 * 取多少字节：只发一次 `Range: bytes=0-`，先读 10 字节算出标签总长度，
 *   读够就 reader.cancel() 断开，不会把整首歌拉下来。
 *
 * 只读不写；解析失败一律 resolve({ok:false})，由调用方回退到
 *   music/audio/*.png 与 music/lrc/*.lrc（旧逻辑）。
 *
 * 用法：
 *   Id3.read('伍佰&China Blue - 挪威的森林').then(function (r) {
 *     if (r.cover)  img.src = r.cover;       // Blob URL（内部缓存，勿手动 revoke）
 *     if (r.lyrics) lrcContent = r.lyrics;   // 带时间戳的 LRC 原文
 *   });
 */
(function (global) {
	'use strict';

	var MAX_CACHE = 40;      // 内存里最多留住 40 首的解析结果
	var TAG_CAP = 8 * 1024 * 1024; // 标签长度超过 8MB 视为异常，直接放弃

	var cache = new Map();   // song -> Promise<{cover, lyrics, ok}>

	/** 拼接 Uint8Array 列表，最多取 limit 字节 */
	function concat(chunks, limit) {
		var total = 0, i;
		for (i = 0; i < chunks.length; i++) total += chunks[i].length;
		var n = Math.min(total, limit);
		var out = new Uint8Array(n), off = 0;
		for (i = 0; i < chunks.length && off < n; i++) {
			var c = chunks[i];
			var take = Math.min(c.length, n - off);
			out.set(take === c.length ? c : c.subarray(0, take), off);
			off += take;
		}
		return out;
	}

	/** ID3v2 的“同步安全整数”：每字节只用低 7 位 */
	function syncsafe(b, o) {
		return (b[o] & 0x7f) << 21 | (b[o + 1] & 0x7f) << 14 | (b[o + 2] & 0x7f) << 7 | (b[o + 3] & 0x7f);
	}
	function be32(b, o) {
		return (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3];
	}

	/** 只取文件头：够标签长度就断开 */
	function readHead(url) {
		return fetch(url, { headers: { Range: 'bytes=0-' } }).then(function (res) {
			if (!res.ok && res.status !== 206) throw new Error('HTTP ' + res.status);
			if (!res.body || !res.body.getReader) {
				// 极老的浏览器没有流式 body：退回整份读取，只留前 1MB
				return res.arrayBuffer().then(function (b) { return new Uint8Array(b).subarray(0, 1 << 20); });
			}
			var reader = res.body.getReader();
			var chunks = [], got = 0, need = -1;
			function pump() {
				return reader.read().then(function (r) {
					if (r.done) {
						reader.cancel().catch(function () { });
						return concat(chunks, need > 0 ? need : got);
					}
					chunks.push(r.value);
					got += r.value.length;
					if (need < 0 && got >= 10) {
						var head = concat(chunks, 10);
						need = (head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33) // "ID3"
							? 10 + syncsafe(head, 6) : 16;
						if (need > TAG_CAP) need = 16; // 头部坏了，别跟着下整首
					}
					if (need > 0 && got >= need) {
						reader.cancel().catch(function () { }); // 标签读完就断开
						return concat(chunks, need);
					}
					return pump();
				});
			}
			return pump();
		});
	}

	function decodeText(b, enc, start, end) {
		var view = b.subarray(start, end);
		if (enc === 0) { // ISO-8859-1
			var s = '';
			for (var i = 0; i < view.length; i++) s += String.fromCharCode(view[i]);
			return s;
		}
		if (enc === 3) { // UTF-8
			return new TextDecoder('utf-8').decode(view);
		}
		// 1 = UTF-16(带 BOM)  2 = UTF-16BE(无 BOM)
		var le = true;
		if (view.length >= 2) {
			if (view[0] === 0xFE && view[1] === 0xFF) { le = false; view = view.subarray(2); }
			else if (view[0] === 0xFF && view[1] === 0xFE) { le = true; view = view.subarray(2); }
			else le = (enc !== 2);
		}
		return new TextDecoder(le ? 'utf-16le' : 'utf-16be').decode(view);
	}

	/** 找字符串结束符（0x00 或 UTF-16 的 0x00 0x00），返回下一字节位置 */
	function skipTerminated(b, start, end, enc) {
		if (enc === 1 || enc === 2) {
			for (var i = start; i + 1 < end; i += 2) {
				if (b[i] === 0 && b[i + 1] === 0) return i + 2;
			}
			return end;
		}
		for (var j = start; j < end; j++) if (b[j] === 0) return j + 1;
		return end;
	}

	/** 拆帧，返回 {cover:{data,mime}, lyrics:string} */
	function parseFrames(b, start, end, safeSize) {
		var out = { cover: null, lyrics: null };
		var p = start;
		while (p + 10 <= end) {
			var id = String.fromCharCode(b[p], b[p + 1], b[p + 2], b[p + 3]);
			if (!/^[A-Z0-9]{4}$/.test(id)) break; // 进入填充区或音频数据
			var size = safeSize ? syncsafe(b, p + 4) : be32(b, p + 4);
			if (size <= 0 || p + 10 + size > end) break;
			var body = p + 10, bend = body + size;

			if (id === 'APIC' && !out.cover) {
				var enc = b[body];
				var mimeEnd = skipTerminated(b, body + 1, bend, 0);
				var mime = '';
				for (var i = body + 1; i < mimeEnd - 1; i++) mime += String.fromCharCode(b[i]);
				var descEnd = skipTerminated(b, mimeEnd + 1, bend, enc);
				if (bend > descEnd) out.cover = { data: b.slice(descEnd, bend), mime: mime || 'image/jpeg' };
			} else if (id === 'USLT' && !out.lyrics) {
				var e2 = b[body];
				var txtStart = skipTerminated(b, body + 4, bend, e2);
				out.lyrics = decodeText(b, e2, txtStart, bend)
					.replace(/\r\n?/g, '\n').replace(/\u0000+$/, '').trim();
				if (!out.lyrics) out.lyrics = null;
			}
			p = bend;
		}
		return out;
	}

	/** 解析已取到的文件头字节 */
	function parse(buf) {
		if (buf.length < 10 || buf[0] !== 0x49 || buf[1] !== 0x44 || buf[2] !== 0x33) return null; // "ID3"
		var safeSize = buf[3] === 4;                 // v2.4 的帧长度是 syncsafe
		var size = syncsafe(buf, 6);
		var end = Math.min(10 + size, buf.length);
		return parseFrames(buf, 10, end, safeSize);
	}

	function read(song) {
		if (cache.has(song)) return cache.get(song);
		var url = 'music/' + encodeURIComponent(song) + '.mp3';
		var p = readHead(url).then(function (buf) {
			var parsed = parse(buf) || { cover: null, lyrics: null };
			var res = { cover: null, lyrics: parsed.lyrics || null, ok: true };
			if (parsed.cover && parsed.cover.data && parsed.cover.data.length) {
				try {
					res.cover = URL.createObjectURL(new Blob([parsed.cover.data], { type: parsed.cover.mime }));
				} catch (e) { res.cover = null; }
			}
			return res;
		}).catch(function () {
			return { cover: null, lyrics: null, ok: false };
		});

		cache.set(song, p);
		if (cache.size > MAX_CACHE) {
			var first = cache.keys().next().value;
			cache.get(first).then(function (r) {
				if (r && r.cover && r.cover.indexOf('blob:') === 0) URL.revokeObjectURL(r.cover);
			}).catch(function () { });
			cache.delete(first);
		}
		return p;
	}

	global.Id3 = { read: read, clear: function () { cache.clear(); } };
})(window);
