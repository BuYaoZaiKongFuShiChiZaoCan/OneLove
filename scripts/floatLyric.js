/**
 * 桌面悬浮歌词
 *
 * 电脑（Chrome / Edge 116+）：用 Document Picture-in-Picture 开一个独立窗口，
 *   始终置顶、可以拖到屏幕任意位置、可以缩放，盖在其他应用之上。
 * 手机 / 不支持该 API 的浏览器：退化成页面内可拖动的悬浮层（切走标签页就看不到）。
 *
 * 内容直接读主界面 #lrc 里被标记 active 的那一行，不另建一套歌词解析，
 * 保证两边永远同步。显示模式（三行 / 单行 / 歌名封面）存在 localStorage，
 * 入口在侧边菜单。
 */
(function () {
	'use strict';

	var MODE_KEY = 'floatLyricMode';
	var POS_KEY = 'floatLyricPos';
	var MODES = [
		{ key: 'three', label: '三行' },
		{ key: 'one', label: '单行' },
		{ key: 'meta', label: '歌名封面' }
	];

	// 图标用内联 SVG：PiP 窗口是独立 document，拿不到主页面的 font-awesome 样式
	var ICONS = {
		prev: '<svg viewBox="0 0 24 24"><path d="M7 5h2v14H7zm12 0L9 12l10 7V5z"/></svg>',
		play: '<svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7V5z"/></svg>',
		pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>',
		next: '<svg viewBox="0 0 24 24"><path d="M15 5h2v14h-2zM6 5l10 7L6 19V5z"/></svg>',
		close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
	};

	// PiP 窗口是独立 document：只给它做 html/body 重置，绝不能注入到主页面（会把主站滚动锁死）
	var STYLE_BASE = [
		'html,body{margin:0;padding:0;height:100%;background:#101012;color:#eee;',
		'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;',
		'overflow:hidden;-webkit-user-select:none;user-select:none}'
	].join('');

	// PiP 与页面内悬浮层共用的部分，全部挂在 #flRoot 下面，不碰主站任何样式
	var STYLE_COMMON = [
		'#flRoot{position:relative;height:100%;box-sizing:border-box;padding:10px 14px;',
		'display:flex;flex-direction:column;justify-content:center;gap:6px;',
		'color:#eee;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;',
		'-webkit-user-select:none;user-select:none}',
		'#flRoot .fl-meta{display:none;align-items:center;gap:8px;min-width:0;padding-right:14px}',
		'#flRoot[data-mode="meta"] .fl-meta{display:flex}',
		'#flRoot .fl-cover{width:30px;height:30px;border-radius:6px;object-fit:cover;background:#222;flex:0 0 auto}',
		'#flRoot .fl-title{font-size:12px;color:#b9b9b9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
		'#flRoot .fl-lines{display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;min-width:0}',
		'#flRoot .fl-prev,#flRoot .fl-next{font-size:13px;color:#8d8d8d;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
		'#flRoot .fl-now{font-size:18px;font-weight:600;color:pink;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
		'#flRoot[data-mode="one"] .fl-prev,#flRoot[data-mode="one"] .fl-next,',
		'#flRoot[data-mode="meta"] .fl-prev,#flRoot[data-mode="meta"] .fl-next{display:none}',
		'#flRoot .fl-bar{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:2px}',
		'#flRoot .fl-btn{border:0;background:transparent;color:#cfcfcf;cursor:pointer;padding:3px;line-height:0;border-radius:6px}',
		'#flRoot .fl-btn svg{width:15px;height:15px;fill:currentColor}',
		'#flRoot .fl-btn:hover{color:pink}',
		'#flRoot .fl-btn:active{transform:scale(.92)}',
		'#flRoot .fl-close{position:absolute;top:5px;right:7px;padding:2px}',
		'#flRoot .fl-close svg{width:13px;height:13px}'
	].join('');

	// 只在「页面内悬浮层」生效
	var STYLE_INLINE = [
		'#flRoot{position:fixed;width:300px;height:auto;padding:14px 16px;',
		'background:rgba(16,16,18,.9);border-radius:12px;border:1px solid rgba(255,255,255,.12);',
		'box-shadow:0 10px 28px rgba(0,0,0,.4);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
		'z-index:99999;cursor:move;touch-action:none}'
	].join('');

	var pipWindow = null;      // Document PiP 窗口
	var inlineRoot = null;     // 页面内降级层
	var tickTimer = null;
	var lastSig = '';

	/* ---------------- 配置 ---------------- */

	function getMode() {
		var v = null;
		try { v = localStorage.getItem(MODE_KEY); } catch (e) { }
		for (var i = 0; i < MODES.length; i++) {
			if (MODES[i].key === v) return v;
		}
		return 'three';
	}

	function modeLabel() {
		var cur = getMode();
		for (var i = 0; i < MODES.length; i++) {
			if (MODES[i].key === cur) return MODES[i].label;
		}
		return '三行';
	}

	/** 侧边菜单上的按钮文字跟着模式走 */
	function renderModeBtn() {
		var btn = document.getElementById('floatLyricModeBtn');
		if (!btn) return;
		var span = btn.querySelector('span');
		if (span) span.textContent = '显示内容：' + modeLabel();
	}

	/** 侧边菜单点一下：三行 → 单行 → 歌名封面 → 三行 */
	function cycleMode() {
		var cur = getMode();
		var idx = 0;
		for (var i = 0; i < MODES.length; i++) {
			if (MODES[i].key === cur) idx = i;
		}
		var next = MODES[(idx + 1) % MODES.length].key;
		try { localStorage.setItem(MODE_KEY, next); } catch (e) { }
		renderModeBtn();
		lastSig = '';
		applyMode();
		tick();
	}

	function applyMode() {
		var m = getMode();
		var roots = [];
		if (pipWindow && pipWindow.document.getElementById('flRoot')) {
			roots.push(pipWindow.document.getElementById('flRoot'));
		}
		if (inlineRoot) roots.push(inlineRoot);
		for (var i = 0; i < roots.length; i++) roots[i].setAttribute('data-mode', m);
	}

	/* ---------------- 取歌词 ---------------- */

	function currentIndex() {
		var list = document.getElementById('lrc');
		if (!list) return -1;
		var act = list.querySelector('li.active');
		if (!act) return -1;
		return Array.prototype.indexOf.call(list.children, act);
	}

	function lineText(list, i) {
		var li = list && list.children[i];
		if (!li) return '';
		return (li.textContent || '').replace(/\s+/g, ' ').trim();
	}

	function currentSong() {
		var t = document.getElementById('title');
		return t ? (t.textContent || '').trim() : '';
	}

	function coverUrl(song) {
		if (!song) return '';
		try {
			return new URL('music/audio/' + encodeURIComponent(song) + '.png', location.href).href;
		} catch (e) {
			return '';
		}
	}

	/* ---------------- 建 UI ---------------- */

	function buildRoot(doc) {
		var root = doc.createElement('div');
		root.id = 'flRoot';
		root.setAttribute('data-mode', getMode());
		root.innerHTML =
			'<div class="fl-meta"><img class="fl-cover" alt="" /><div class="fl-title"></div></div>' +
			'<div class="fl-lines">' +
			'<div class="fl-prev"></div>' +
			'<div class="fl-now">♪</div>' +
			'<div class="fl-next"></div>' +
			'</div>' +
			'<div class="fl-bar">' +
			'<button class="fl-btn fl-prev-btn" title="上一首">' + ICONS.prev + '</button>' +
			'<button class="fl-btn fl-play-btn" title="播放 / 暂停">' + ICONS.play + '</button>' +
			'<button class="fl-btn fl-next-btn" title="下一首">' + ICONS.next + '</button>' +
			'</div>' +
			'<button class="fl-btn fl-close" title="关闭悬浮歌词">' + ICONS.close + '</button>';

		root.querySelector('.fl-prev-btn').addEventListener('click', function () {
			if (typeof prevSong === 'function') prevSong();
		});
		root.querySelector('.fl-next-btn').addEventListener('click', function () {
			if (typeof nextSong === 'function') nextSong();
		});
		root.querySelector('.fl-play-btn').addEventListener('click', function () {
			// 和主界面按钮一致的判断：MV 正在加载时点一下就直接播音频，不必点两次
			if (audio.paused && typeof mvIsLoading === 'function' && mvIsLoading()) {
				playSong(true);
				return;
			}
			if (audio.paused) {
				if (typeof mvIsPlaying === 'function' && mvIsPlaying()) {
					// MV 在出声：音频是暂停的，点一下应该暂停视频
					if (window.audioMvVideo1) window.audioMvVideo1.pause();
					return;
				}
				playSong();
			} else {
				pauseSong();
			}
		});
		root.querySelector('.fl-close').addEventListener('click', function () {
			closeFloatLyric();
		});
		return root;
	}

	function syncPlayIcon() {
		var roots = [];
		if (pipWindow) roots.push(pipWindow.document);
		if (inlineRoot) roots.push(document);
		var playing = !audio.paused || (typeof mvIsPlaying === 'function' && mvIsPlaying());
		for (var i = 0; i < roots.length; i++) {
			var btn = roots[i].getElementById('flRoot');
			if (!btn) continue;
			var pb = btn.querySelector('.fl-play-btn');
			if (pb) pb.innerHTML = playing ? ICONS.pause : ICONS.play;
		}
	}

	/* ---------------- 内容同步 ---------------- */

	function tick() {
		// 用户把 PiP 窗口关掉后，定时器该自己收工，不用等他再点按钮
		if (pipWindow && pipWindow.closed) { syncPipState(); return; }
		var doc = pipWindow ? pipWindow.document : (inlineRoot ? document : null);
		if (!doc) return;
		var root = doc.getElementById('flRoot');
		if (!root) return;

		var list = document.getElementById('lrc');
		var idx = currentIndex();
		var prev = idx > 0 ? lineText(list, idx - 1) : '';
		var now = idx >= 0 ? lineText(list, idx) : '';
		var next = (list && idx >= 0) ? lineText(list, idx + 1) : '';
		var song = currentSong();
		if (!now) now = song ? '♪ ' + song : '♪';

		var sig = getMode() + '|' + song + '|' + prev + '|' + now + '|' + next;
		if (sig === lastSig) return;
		lastSig = sig;

		var elNow = root.querySelector('.fl-now');
		var elPrev = root.querySelector('.fl-prev');
		var elNext = root.querySelector('.fl-next');
		if (elNow) elNow.textContent = now;
		if (elPrev) elPrev.textContent = prev;
		if (elNext) elNext.textContent = next;

		var elTitle = root.querySelector('.fl-title');
		if (elTitle) elTitle.textContent = song;
		var elCover = root.querySelector('.fl-cover');
		if (elCover) {
			var url = coverUrl(song);
			if (url && elCover.getAttribute('src') !== url) {
				elCover.setAttribute('src', url);
				elCover.onerror = function () { this.style.visibility = 'hidden'; };
				elCover.onload = function () { this.style.visibility = 'visible'; };
			}
		}
		syncPlayIcon();
	}

	function startTicking() {
		stopTicking();
		// timeupdate 在后台标签页也会触发（页面隐藏时 setInterval 会被节流），
		// 两个一起用：正常播放靠事件，切歌/暂停/无 timeupdate 时靠定时器兜底
		audio.addEventListener('timeupdate', tick);
		tickTimer = setInterval(tick, 500);
		tick();
	}

	function stopTicking() {
		audio.removeEventListener('timeupdate', tick);
		if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
	}

	/* ---------------- 打开 / 关闭 ---------------- */

	function pipSupported() {
		return typeof window.documentPictureInPicture === 'object' &&
			window.documentPictureInPicture !== null &&
			typeof window.documentPictureInPicture.requestWindow === 'function';
	}

	/**
	 * 以浏览器的真实状态为准回收状态。
	 * 用户点 PiP 窗口的关闭按钮时，pagehide 不一定及时触发（无头环境下实测收不到），
	 * 只靠事件会出现「窗口已经没了、变量还指着它」，再点播放器按钮就变成「点一下关闭」而打不开。
	 */
	function syncPipState() {
		if (!pipWindow) return;
		// window.closed 是 WindowProxy 上最可靠的判据：
		// documentPictureInPicture.window 在窗口关掉后不一定马上变 null，
		// pagehide 在无头环境里也收不到，只有它能立刻反映真实状态。
		if (!pipWindow.closed) return;
		pipWindow = null;
		stopTicking();
		lastSig = '';
	}

	function openFloatLyric() {
		syncPipState();
		if (pipWindow || inlineRoot) { closeFloatLyric(); return; }

		if (pipSupported()) {
			openViaPip();
		} else {
			openInline();
		}
	}

	function openViaPip() {
		// requestWindow 必须在用户手势里直接调用，所以这里不 await 前面的异步逻辑
		documentPictureInPicture.requestWindow({ width: 360, height: 172 })
			.then(function (win) {
				pipWindow = win;
				var doc = win.document;
				var style = doc.createElement('style');
				style.textContent = STYLE_BASE + STYLE_COMMON;
				doc.head.appendChild(style);
				doc.title = '悬浮歌词';
				doc.body.appendChild(buildRoot(doc));
				win.addEventListener('pagehide', function () {
					// 用户点了窗口的关闭按钮
					pipWindow = null;
					stopTicking();
					lastSig = '';
				});
				applyMode();
				lastSig = '';
				startTicking();
			})
			.catch(function (err) {
				// 浏览器拒了（非安全上下文 / 策略限制）→ 退回页面内悬浮层
				console.warn('Document PiP 打开失败，改用页面内悬浮层：', err);
				openInline();
			});
	}

	function openInline() {
		if (!document.getElementById('flFloatStyle')) {
			var style = document.createElement('style');
			style.id = 'flFloatStyle';
			style.textContent = STYLE_COMMON + STYLE_INLINE;
			document.head.appendChild(style);
		}
		document.body.classList.add('fl-inline');
		var root = buildRoot(document);
		document.body.appendChild(root);
		inlineRoot = root;
		applyMode();
		restoreInlinePos(root);
		enableInlineDrag(root);
		lastSig = '';
		startTicking();
	}

	function closeFloatLyric() {
		if (pipWindow) {
			try { pipWindow.close(); } catch (e) { }
			pipWindow = null;
		}
		if (inlineRoot) {
			if (inlineRoot.parentNode) inlineRoot.parentNode.removeChild(inlineRoot);
			inlineRoot = null;
			document.body.classList.remove('fl-inline');
		}
		stopTicking();
		lastSig = '';
	}

	/* ---------------- 页面内悬浮层的拖动 ---------------- */

	function restoreInlinePos(root) {
		var pos = null;
		try { pos = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { }
		var w = root.offsetWidth || 300;
		var h = root.offsetHeight || 120;
		var left, top;
		if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
			left = pos.left;
			top = pos.top;
		} else {
			left = Math.max(8, window.innerWidth - w - 16);
			top = Math.max(8, window.innerHeight - h - 90);
		}
		left = Math.min(Math.max(left, 4), Math.max(4, window.innerWidth - w - 4));
		top = Math.min(Math.max(top, 4), Math.max(4, window.innerHeight - h - 4));
		root.style.left = left + 'px';
		root.style.top = top + 'px';
	}

	function enableInlineDrag(root) {
		var dragging = false, offX = 0, offY = 0;
		root.addEventListener('pointerdown', function (e) {
			// 点在按钮上就交给按钮
			if (e.target.closest('button')) return;
			dragging = true;
			var rect = root.getBoundingClientRect();
			offX = e.clientX - rect.left;
			offY = e.clientY - rect.top;
			try { root.setPointerCapture(e.pointerId); } catch (err) { }
		});
		root.addEventListener('pointermove', function (e) {
			if (!dragging) return;
			var w = root.offsetWidth, h = root.offsetHeight;
			var left = Math.min(Math.max(e.clientX - offX, 4), Math.max(4, window.innerWidth - w - 4));
			var top = Math.min(Math.max(e.clientY - offY, 4), Math.max(4, window.innerHeight - h - 4));
			root.style.left = left + 'px';
			root.style.top = top + 'px';
		});
		root.addEventListener('pointerup', function (e) {
			if (!dragging) return;
			dragging = false;
			try { root.releasePointerCapture(e.pointerId); } catch (err) { }
			saveInlinePos(root);
		});
		root.addEventListener('pointercancel', function () {
			dragging = false;
		});
	}

	function saveInlinePos(root) {
		try {
			localStorage.setItem(POS_KEY, JSON.stringify({
				left: parseInt(root.style.left, 10) || 0,
				top: parseInt(root.style.top, 10) || 0
			}));
		} catch (e) { }
	}

	/* ---------------- 对外暴露 ---------------- */

	window.openFloatLyric = openFloatLyric;
	window.closeFloatLyric = closeFloatLyric;
	window.cycleFloatLyricMode = cycleMode;
	window.isFloatLyricOpen = function () { syncPipState(); return !!(pipWindow || inlineRoot); };

	// 侧边菜单在页面里是静态 HTML，脚本执行时它已经存在
	var modeBtn = document.getElementById('floatLyricModeBtn');
	if (modeBtn) modeBtn.addEventListener('click', cycleMode);
	renderModeBtn();

	// 播放器上的入口按钮
	var openBtn = document.getElementById('floatLyricBtn');
	if (openBtn) openBtn.addEventListener('click', function () { openFloatLyric(); });

	audio.addEventListener('play', syncPlayIcon);
	audio.addEventListener('pause', syncPlayIcon);
	audio.addEventListener('ended', syncPlayIcon);
})();
