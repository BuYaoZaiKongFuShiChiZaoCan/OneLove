const musicContainer = document.getElementById("music-container");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const audio = document.getElementById("audio");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const title = document.getElementById("title");
const musicCover = document.getElementById("music-cover");
const musicList = document.getElementById('musicList');

// 默认从第一首开始
let songIndex = +window.localStorage.getItem('songIndex') || 0;
// 列表条目经过增删（8865 → 8853）后，localStorage 里存的下标可能已经越界，兜一下底
if (songIndex < 0 || songIndex >= songs.length) {
	songIndex = 0;
}

// 向页面输出音乐数量
document.getElementById('playlistLength').textContent = songs.length;
/**
 * requestIdleCallback 兜底：Safari 至今没有实现它，缺失时列表渲染会直接抛错。
 * 降级为 setTimeout，timeRemaining 给个固定值（配合 performChunk 的单片条数上限使用）。
 */
if (!window.requestIdleCallback) {
	window.requestIdleCallback = function (cb) {
		return setTimeout(function () {
			cb({ didTimeout: true, timeRemaining: function () { return 1; } });
		}, 1);
	};
}
if (!window.cancelIdleCallback) {
	window.cancelIdleCallback = function (id) { clearTimeout(id); };
}

/**
 * 把「正在播放」样式贴到当前歌曲所在的那一行。
 * 原实现每次切歌都要遍历整个 songs（现在 8800+ 条）并为每个节点做 classList 增删，
 * 现在只碰两个节点：清掉上一个高亮、点亮当前这个。
 * 依旧按「下标」判断而不是按歌名（歌名可能重复，会导致两行同时高亮）。
 * @param {HTMLElement} container 列表容器（#musicList 或 #dog）
 * @returns {void}
 */
function highlightIn(container) {
	if (!container) return;
	// getElementsByTagName 返回的是活集合；第 0 个 div 是 h2 里的「播放列表」，歌曲从下标 1 开始
	const rows = container.getElementsByTagName('div');
	const cur = rows[songIndex + 1];
	const old = container.querySelector('.musliIng');
	if (old && old !== cur) {
		old.classList.remove('musliIng');
	}
	if (cur) {
		cur.classList.add('musliIng');
	}
}

function listupdate() {
	highlightIn(window.musicList);

	// 当dog显示时更新dog内歌词列表样式
	if (document.querySelector('#dog #playlistPanel')) {
		highlightIn(document.querySelector('#dog'));
	}
}

/**
 * 实测一行歌词的高度，写进 CSS 变量 --row-h。
 * #musicList 与 #dog 里的行用的是 content-visibility:auto，
 * 视口外的行不参与布局，需要靠 contain-intrinsic-size 里的这个数值占位；
 * 值不准（比如按 19px 占位而真实是 22px）会让滚动条长度一路乱跳。
 * @returns {void}
 */
function measureRowHeight() {
	const first = window.musicList.children[1];// [0] 是 h2，[1] 才是第一首歌
	if (!first) return;
	const h = first.getBoundingClientRect().height;
	if (h > 0) {
		document.documentElement.style.setProperty('--row-h', Math.round(h) + 'px');
	}
}

// 输出列表，使用更高阶的分时函数去封装，也就是不让这个插入元素时阻塞浏览器渲染，分段去渲染，回到16.6ms渲染一次的状态
// 手机等触屏设备单片插 400 行会让主线程长时间忙不过来，期间点播放/切歌都没反应，单片减到 80
const CHUNK_MAX = (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 80 : 400;// 单片条数上限：timeRemaining 偶尔会虚高，防止一口气把几千条插进 DOM
function performChunk(datas) {
	if (datas.length === 0) {
		return;
	}
	let i = 0;
	let measured = false;
	let scrolled = false;// 当前播放的那一行渲染出来后先滚过去，不必等 8800+ 条全部插完
	// 开启下一个分片的执行
	function _run() {
		if (i >= datas.length) {// 大于了也就是输出结束了
			listupdate();
			if (!scrolled) scrollToIng();
			return;
		}
		// 一个渲染帧中，空闲时开启分片执行
		// 加 timeout 兜底：主线程一直有活（音频解码、歌词请求）或在后台标签页时，
		// 空闲回调可能长时间不触发，列表会永远停在渲染到一半
		requestIdleCallback((idle) => {
			// 得到当前这一帧剩余多少毫秒 idle.timeRemaining()
			let fragment = document.createDocumentFragment();
			let n = 0;
			// 被 timeout 强制叫起来时 timeRemaining() 返回 0。这时不能继续按「剩余时间」判断，
			// 否则每片只插 1 条，8800+ 条要拖几十分钟；改成按固定批量（CHUNK_MAX）补齐。
			// 用 do-while 而不是 while：保证每片至少插 1 条，不会空转死循环。
			const forced = idle.timeRemaining() <= 0;
			do {
				let div = document.createElement('div');
				div.id = i;
				let span = document.createElement('span');
				span.classList.add('musicItem');
				span.textContent = (i + 1) + '.';
				div.appendChild(span);
				div.appendChild(document.createTextNode(datas[i]));
				fragment.appendChild(div);
				i++;
				n++;
			} while (i < datas.length && n < CHUNK_MAX && (forced || idle.timeRemaining() > 0));
			musicList.appendChild(fragment);
			if (!measured) {// 第一批插完就能量出真实行高
				measured = true;
				measureRowHeight();
			}
			if (!scrolled && i > songIndex) {
				scrolled = true;
				listupdate();
				scrollToIng();
			}
			// 此次分片完成
			_run();
		}, { timeout: 200 });
	}
	_run();
}
performChunk(songs)

// 列表点击
window.musicList.addEventListener('click', function (e) {
	e.preventDefault();
	e.stopPropagation();
	// console.log(e);

	let targetId = e.target.id;
	let targetIndex = +targetId;
	if (targetId && targetId !== 'playlistPanel' && targetId !== 'musicList') {
		if (songIndex === targetIndex) {
			audio.paused ? playSong() : pauseSong();
		} else {
			// 点击后设置一下当前播放音乐的index，不然songindex还是之前的，到下一首就会以之前播放的音乐为下一首跳转
			songIndex = targetIndex;
			loadSong(songs[songIndex]);
		}
	}
})

let mErrTimeout = null;
let lastChange = "nextSong";
let errorCount = 0;
// 连续失败上限：出错一次就先自动跳下一首，连跳这么多首都失败才真停下来
const MAX_ERR = 5;
// 停下来时往后探测多少首去找「确定能播」的那一首（8 个并发，200 首约 2–4 秒）
const PROBE_LIMIT = 200;
// 探测到可播歌曲后用它切歌、但不要自动播放；用一次就消掉
let suppressAutoplay = false;
/**
 * 「我们主动把 MV 视频停掉」的时间窗（毫秒时间戳），不是用户按的暂停。
 * playSong() 会 pause 还在播的 MV 视频（声音改由音频出）。video 的 pause 事件是异步派发的，
 * 用一个立刻复位的一次性布尔标志会在事件到达前就被清掉，所以用时间窗。
 * audioMv.js 的 video.onpause 据此区分「用户主动暂停」和「我们改播音频」。
 */
let suppressVideoPauseUntil = 0;
/**
 * 「我们是否想要播放」——用来判断出错后该不该自动跳下一首。
 * 不能再看播放按钮的图标状态：404 时 audio.play() 会以 NotSupportedError 被拒，
 * playSong() 的 catch 于是把图标改回 fa-play，旧的判断据此以为「用户按了暂停」，
 * 就停在原地只弹「已暂停自动切换」不动 —— 这就是「一出错就直接暂停」的直接原因。
 * 只有 playSong() 置 true、pauseSong() 置 false，用户点暂停才算真的不想播。
 */
let playIntent = false;
/**
 * 本首歌是否已经真正出声过。
 * 「音频加载中…」只用于「切歌后还没响」的阶段；播放中拖进度条也会派发 waiting，
 * 若不加这道闸，拖一次进度条歌词就被换成加载提示，而且不再是第一次出声，
 * playing 事件不一定再触发，提示会一直卡在那儿（实测复现过）。
 */
let songStarted = false;

/**
 * 成功出声就把连败计数清零。
 * 「连续 5 次失败」必须是连续的：原来没有清零，一天里累计 5 次失败就会被判成连败，
 * 这也是一路播下来偶尔「出错就直接暂停」的原因之一。
 */
audio.addEventListener('playing', function () {
	errorCount = 0;
	markSoundStarted();
	setPlayUI(true);
	// 真正出声了封面才转（封面 = 有没有声音，不是「点了没点」）
	setCoverSpin(true);
	// 音频真的开始出声了，把加载提示换回歌词
	restoreLrc();
});

/**
 * 外观以真实播放状态为准（详见 setPlayUI 的注释）。
 * play 在「开始播」时触发，playing 在「确实有数据在出声」时触发，两者都说明该显示播放中。
 * 注意这里不动封面：play 只是「请求开始」，此时可能还在缓冲，出声了由 playing 打开。
 */
audio.addEventListener('play', function () {
	setPlayUI(true);
});

/**
 * 真正的暂停（含播完、出错停下）→ 显示暂停图标。
 * 切歌时改 src 派发的是 emptied 而不是 pause，所以这里不会把「马上要播的新歌」误标成暂停。
 */
audio.addEventListener('pause', function () {
	// 没声音了封面就停（播完也一样，所以要放在下面的 ended 判断之前）
	setCoverSpin(false);
	if (audio.ended) return;
	/**
	 * 有 MV 的歌：音频被暂停是「声音改由视频出」，不是用户按了暂停。
	 * MV 正在出声时，播放器整体仍然是播放中，按钮必须保持暂停图标。
	 * （audio.pause() 的 pause 事件是异步派发的，可能在 video.onplay 里补的 setPlayUI(true)
	 *   之后才到达，所以这里也要拦一次，否则会被它改回播放图标。）
	 */
	if (typeof mvIsPlaying === 'function' && mvIsPlaying()) {
		setPlayUI(true);
		return;
	}
	setPlayUI(false);
});

/**
 * 缓冲中（有播放意图但还没数据）→ 歌词位置提示「音频加载中…」。
 * 用户反馈：切歌后界面看着没问题，实际还没出声，分不清是在加载还是已经播了。
 */
audio.addEventListener('waiting', function () {
	if (playIntent && audio.readyState < 3) showAudioLoading();
});

/**
 * 探测某一首线上是否真的有 mp3。
 * 实测 Netlify：文件存在 → 200 + content-type: audio/mpeg；不存在 → 404 + text/html。
 * 不带 Range 的 HEAD 就够了，不会真去下 4MB。
 * @param {number} index songs 下标
 * @param {(ok:boolean)=>void} callback 结果回调
 */
function probePlayable(index, callback) {
	const name = songs[index];
	if (!name) { callback(false); return; }
	fetch(`music/${name}.mp3`, { method: 'HEAD' })
		.then(function (res) {
			const type = res.headers.get('content-type') || '';
			callback(res.ok && type.indexOf('audio') === 0);
		})
		.catch(function () { callback(false); });
}

/**
 * 从当前歌曲往后找第一首确实能播的（最多探测 maxTries 首），找不到（含绕回原点）回传 null。
 * 404 密集区里连续几十首都没有文件是常态，所以每批 8 个并发探、按批顺序前进：
 * 一批里取下标最小的可播项，既不会跳过更近的那首，也不会串行等几十个来回。
 * @param {number} maxTries 最多探测几首
 * @param {(index:number|null)=>void} callback 命中下标或 null
 */
function findPlayableAfter(maxTries, callback) {
	const BATCH = 8;
	let tried = 0;
	let finished = false;
	function nextBatch() {
		if (finished) return;
		const idxs = [];
		for (let k = 0; k < BATCH && tried < maxTries; k++, tried++) {
			const i = (songIndex + tried + 1) % songs.length;
			if (i === songIndex || idxs.indexOf(i) >= 0) break;// 绕回原点/整轮走完了
			idxs.push(i);
		}
		if (!idxs.length) { finished = true; callback(null); return; }
		const res = new Array(idxs.length).fill(false);
		let left = idxs.length;
		idxs.forEach(function (idx, n) {
			probePlayable(idx, function (ok) {
				res[n] = ok;
				if (--left > 0) return;
				const hit = res.indexOf(true);
				if (hit >= 0) { finished = true; callback(idxs[hit]); return; }
				nextBatch();
			});
		});
	}
	nextBatch();
}

/**
 * 连败到达上限：暂停，并把播放位置挪到一首「确定能播」的歌上（不自动播）。
 * 不这么做的话，停下来的很可能又是一首 404，用户点播放立刻再错一次。
 */
function stopAfterErrors() {
	errorCount = 0;
	pauseSong();
	tanChuang(`连续 ${MAX_ERR} 首加载失败，已暂停`, 2000);
	findPlayableAfter(PROBE_LIMIT, function (idx) {
		if (idx === null) return;// 后面 PROBE_LIMIT 首都探测不到音频，就停在当前这首
		songIndex = idx;
		suppressAutoplay = true;
		loadSong(songs[songIndex]);
		pauseSong();
	});
}

// 音乐加载错误
function MusicError() {
	errorCount++;
	clearTimeout(mErrTimeout);
	// 连败到上限：停下来（不再无限往后跳）
	if (errorCount >= MAX_ERR) {
		stopAfterErrors();
		return;
	}
	mErrTimeout = setTimeout(() => {
		mErrTimeout = null;
		// 只要还想播（playIntent）就往后跳；用户自己按了暂停才不动
		if (playIntent) {
			lastChange === "prevSong" ? prevSong() : nextSong();
		} else {
			tanChuang('已暂停自动切换', 3700)
		}
	}, 2000)
}
audio.addEventListener('error', MusicError);

// 更新歌曲细节
function loadSong(song) {
	/**
	 * 切歌必须作废上一次「出错后自动跳下一首」的定时器。
	 * 之前只有 playSong() 里清，切到「有 MV 的歌」走的是 audioMvmain() 分支，不会清，
	 * 于是旧的 2 秒定时器在切歌之后又触发一次 nextSong —— 表现就是明明切到了下一首，
	 * 却又被多跳一首（用户报的「能正常播放却被自动切走，切回上一首才听得到」）。
	 */
	clearTimeout(mErrTimeout);
	mErrTimeout = null;
	// 新的一首：还没出声，加载提示可以显示；出声后由 playing 事件关掉
	songStarted = false;
	// 页面初始化之后的 loadSong 都算换歌：上一次的续播点作废，
	// 否则新歌的 loadedmetadata 一到就会被拉到旧歌的时间点
	if (pageInitDone) resumePending = false;
	// 切歌瞬间封面先停，等本首真的出声再转（上一首的旋转不能延续到这一首）
	setCoverSpin(false);
	title.textContent = song;
	audio.src = `music/${song}.mp3`;
	applyCover(song);
}

/**
 * 封面加载：优先用 mp3 内嵌的封面（scripts/id3.js 从 ID3v2 的 APIC 帧读），
 * 没有封面 / 读失败 / 3 秒没读出来 → 回退到原来的 music/audio/<歌名>.png。
 * 两条路都保留，所以旧的封面文件还在就能照常显示。
 */
function applyCover(song) {
	// 兜底：万一解析卡住，3 秒后先按老逻辑显示 png，不至于一直没有封面
	const pngTimer = setTimeout(function () {
		if (songs[songIndex] === song) musicCover.src = `music/audio/${song}.png`;
	}, 3000);
	if (!window.Id3) {
		clearTimeout(pngTimer);
		musicCover.src = `music/audio/${song}.png`;
		return;
	}
	Id3.read(song).then(function (r) {
		clearTimeout(pngTimer);
		if (songs[songIndex] !== song) return; // 已经切到别的歌，丢弃
		musicCover.src = (r && r.cover) ? r.cover : `music/audio/${song}.png`;
	}).catch(function () {
		clearTimeout(pngTimer);
		if (songs[songIndex] === song) musicCover.src = `music/audio/${song}.png`;
	});
}

/**
 * 歌词加载：优先用 mp3 内嵌的 USLT 帧（内容就是带时间戳的 LRC 原文），
 * 没有 / 读失败 / 3 秒没读出来 → 回退到原来的 music/lrc/<歌名>.lrc。
 */
function applyLyrics(song) {
	lrc.textContent = '加载中...';
	if (window.dogLrc) dogLrc.textContent = '加载中...';
	let settled = false;
	function fallback() {
		if (settled || songs[songIndex] !== song) return;
		settled = true;
		getLrc(song);
	}
	if (!window.Id3) { fallback(); return; }
	const lrcTimer = setTimeout(fallback, 3000);
	Id3.read(song).then(function (r) {
		clearTimeout(lrcTimer);
		if (songs[songIndex] !== song) return;
		if (r && r.lyrics) {
			settled = true;
			lrcContent = r.lyrics;
			parseLrc();
		} else {
			fallback();
		}
	}).catch(function () {
		clearTimeout(lrcTimer);
		fallback();
	});
}
loadSong(songs[songIndex]);

/**
 * ===== 播放进度：保存 / 恢复 / 归零 =====
 * 会用到「上次听到哪儿」的地方有三处：
 *   ① 关页面 / 切后台 → 保存（window.on.js 的 beforeunload、pagehide、visibilitychange）
 *   ② 播放中 → 每 5 秒存一次（手机被系统杀进程时 beforeunload 根本不会触发）
 *   ③ 打开页面 → 恢复；换歌 → 归零（见下面 observer 里的 writeSavedProgress(0)）
 *
 * ⚠️ 恢复**不能**挂在 window.onload 上（原来就是这么写的）：
 *    <audio> 和 MV 的 <video> 都是 preload="auto"，load 事件要等它们全部预加载完才触发。
 *    实测（本地，Chrome 无头）：无 MV 的歌要 10.8 秒；有 MV 的歌（浮夸 86MB）16 秒了
 *    还没触发。这段时间里用户点播放，就是从 0 开始 —— 看着完全像「进度没记住」。
 *    现在改成挂在 audio 的 loadedmetadata：音频一拿到时长就恢复，通常 1 秒内到位。
 */
const PROGRESS_KEY = 'musicTime';
const PROGRESS_SONG_KEY = 'musicTimeSong';   // 这条进度是哪一首的，防止把别的歌拉到这个时间点

/** 读上次存的进度；没有 / 是 0 / 是 NaN 一律返回 null */
function readSavedProgress() {
	const t = parseFloat(window.localStorage.getItem(PROGRESS_KEY));
	if (!isFinite(t) || t <= 0) return null;
	const s = window.localStorage.getItem(PROGRESS_SONG_KEY);
	return { t: t, song: (s === null || s === '') ? null : +s };
}

/** 写进度：第 t 秒，idx 不传就是当前歌 */
function writeSavedProgress(t, idx) {
	if (!isFinite(t) || t < 0) t = 0;
	window.localStorage.setItem(PROGRESS_KEY, +t);
	window.localStorage.setItem(PROGRESS_SONG_KEY, (idx === undefined ? songIndex : idx));
}

/**
 * 把「现在的进度」存起来。MV 在播时声音来自 video（audio 被 pauseSong 停着），要以视频为准。
 * 两边都停着（用户按了暂停后关页面）时取较大的那个有效值，别存成 0。
 */
function saveMusicProgress() {
	const video = window.audioMvVideo1;
	const videoPlaying = !!video && video.isConnected && !video.paused
		&& video.readyState > 0 && video.currentTime > 0;
	let t;
	if (videoPlaying) {
		t = video.currentTime;
	} else if (!audio.paused && audio.currentTime > 0) {
		t = audio.currentTime;
	} else {
		const vt = (video && video.currentTime > 0) ? video.currentTime : 0;
		const at = audio.currentTime > 0 ? audio.currentTime : 0;
		t = Math.max(vt, at);
	}
	writeSavedProgress(t);
}

// ② 播放中每 5 秒存一次
let lastProgressSave = 0;
audio.addEventListener('timeupdate', function () {
	if (audio.currentTime <= 0) return;
	const now = Date.now();
	if (now - lastProgressSave < 5000) return;
	lastProgressSave = now;
	writeSavedProgress(audio.currentTime);
});

/**
 * ③ 页面初始化那一首的续播点。
 * 只有「保存的进度就是这首」才恢复；用户还没等 metadata 到就切了歌 → 作废，
 * 不能把新歌拉到旧歌的时间点（原来 window.onload 不校验这个是会跳错的）。
 * ⚠️ 这两个变量故意用 var：loadSong() 在下面第 401 行就被调用了，那时它们还是 undefined，
 *    用 let 会踩暂时性死区直接抛 ReferenceError。
 */
var savedProgress = readSavedProgress();
var resumePending = !!savedProgress && (savedProgress.song === null || savedProgress.song === songIndex);
var pageInitDone = false;   // 初始化那次 loadSong 跑完置 true，之后的 loadSong 都算「换歌」

function resumeAudioPosition() {
	if (!resumePending) return;
	resumePending = false;
	if (!isFinite(audio.duration) || audio.duration <= 0) return;
	// 上次听到结尾了（差不到 1 秒）就从头开始，别卡在最后
	if (savedProgress.t >= audio.duration - 1) return;
	audio.currentTime = savedProgress.t;
}
audio.addEventListener('loadedmetadata', resumeAudioPosition);
// 兜底：万一来不及绑监听（缓存命中，metadata 已经就绪）
if (audio.readyState >= 1) resumeAudioPosition();
pageInitDone = true;

// 图片加载错误设置
function musicimgerr() {
	musicCover.src = './music/audio/error.png';
}
musicCover.addEventListener('error', musicimgerr);

// 点击后跳转当前播放个音乐列表
window.playlistLength.addEventListener('click', function (event) {
	event.stopPropagation();// 阻止父元素事件传播
	// document.querySelectorAll('.musliIng')[0].scrollIntoView({ behavior: 'smooth', block: 'top', inline: 'nearest' });// behavior如何滚动，除了smooth其它的都是瞬间。block垂直对齐。inline水平对齐nearest是默认值
	scrollToIng();
})
function scrollToIng() {
	var parentElement = window.musicList;
	var childElement = document.querySelectorAll('.musliIng')[0];
	if (!childElement) return;// 列表还没渲染到当前播放项时不做定位，否则这里会直接报错

	// 计算父元素到子元素的距离
	var distanceToScroll = childElement.offsetTop - (parentElement.offsetTop * 1.2);// 默认是直接滚到顶部，*1.1就是多往下滚动一行，也就到了top位置，*1.2就滚动了两行，在这里也就是滚动到中间，因为css设置高度只够显示3行

	// 设置父元素的滚动位置
	parentElement.scrollTo({
		top: distanceToScroll,
		behavior: 'smooth'
	})
}

/**
 * 统一切换播放器外观（封面旋转 + 播放/暂停图标）。
 * 关键：外观只应该反映「真实播放状态」。原来 playSong() 里先同步改成「播放中」，
 * 一旦 audio.play() 返回的 promise 被拒（AbortError：播放请求被下一次加载打断），
 * catch 就把图标改回「暂停」，可音频其实随后照常出声了 —— 于是「明明在播，却显示暂停」，
 * 用户点一下按钮才「恢复」，看起来就是每次切歌都要手动点一次。
 * 现在改为：按钮点下去先乐观设一次（保证手感），之后一律以 audio 的 play/playing/pause 事件为准。
 * @param {boolean} on true=显示播放中，false=显示已暂停
 */
function setPlayUI(on) {
	const icon = playBtn.querySelector('i.fas');
	if (on) {
		musicContainer.classList.add('play');
		if (icon) { icon.classList.remove('fa-play'); icon.classList.add('fa-pause'); }
	} else {
		musicContainer.classList.remove('play');
		if (icon) { icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); }
	}
}

/**
 * 封面旋转单独一个开关（类名 audio-on，样式见 style.css）。
 * 为什么不能复用 .play：.play 的语义是「播放器处于播放状态」，playBtn、键盘快捷键都靠它
 * 判断「现在按一下该暂停还是该播放」，所以切歌加载中也必须是 true。但封面要表达的是
 * 「有没有声音」——切歌后还没出声、以及 MV 接管声音（音频被暂停）这两种情况都没有声音。
 * 两者绑在同一个类上，就会出现用户说的「封面在转，但没有任何声音，状态很奇怪」。
 * 现在封面只跟 audio 的 playing / pause 事件走。
 * @param {boolean} on true=封面转（音频真在出声）
 */
function setCoverSpin(on) {
	if (on) {
		musicContainer.classList.add('audio-on');
	} else {
		musicContainer.classList.remove('audio-on');
	}
}

/**
 * 标记「本首已经出过声」。音频和 MV 都算：MV 走 video 播放，音频一直是暂停的，
 * 如果不标，视频之后每次缓冲（waiting）都会被当成「还没响过」，重新盖上加载提示。
 */
function markSoundStarted() {
	songStarted = true;
}

// 播放歌曲
/**
 * @param {boolean} [forceAudio] 强制走音频，不把这次播放交给 MV。
 *   用在「MV 还在加载时用户点了播放按钮」——用户要的是马上听到声音，
 *   而不是继续等 MV（见 playBtn.onclick）。
 */
function playSong(forceAudio) {
	/**
	 * 当前这首有 MV、视频还在、也没被判「播不了」→ 让 MV 接着放（从上次的位置，见 audioMv.js
	 * 的 resumeMvIfNeeded / resumeMvPosition）。以前这里一律走音频，于是重开页面点播放，
	 * MV 那首放的是音频，视频永远停在 0。
	 * forceAudio=true 时跳过这一步（视频还没就绪，用户点播放就是要听音乐）。
	 */
	if (!forceAudio && typeof resumeMvIfNeeded === 'function' && resumeMvIfNeeded()) {
		playIntent = true;
		setPlayUI(true);
		return;
	}

	// 只暂停还挂在文档里的 video：被 updateVideo 清掉的那份已经 detached，
	// 对它 pause() 会触发迟到的 onpause（退出全屏），没有任何意义
	if (window.audioMvVideo1 && window.audioMvVideo1.isConnected) {
		// 这是我们为了改播音频而主动停视频，不是用户按了暂停：开一个时间窗，
		// 让 audioMv.js 的 video.onpause 别把这次 pause 误记成「用户不想听了」
		suppressVideoPauseUntil = Date.now() + 500;
		window.audioMvVideo1.pause();
	}

	// 清除错误超时
	clearTimeout(mErrTimeout);
	mErrTimeout = null;
	playIntent = true;
	// 先乐观设一次外观，让点击立刻有反馈；真正的状态由下面的 play/playing/pause 事件兜底
	setPlayUI(true);
	// 还没到能出声的程度：立刻在歌词位置说明「音乐正在加载中…」。
	// 否则点了播放之后封面不转、歌词还是上一首的，看起来像什么都没发生。
	// （songStarted 为 true 时 showLoading 自己会跳过，播放中拖进度条不会盖住歌词）
	if (audio.readyState < 3) showLoading('music');

	// 手机浏览器（尤其 iOS 低电量模式、微信内置浏览器）可能拒绝 play()，
	// 不 catch 的话界面已经切成「暂停图标」但实际没声音，看起来就像卡住没反应
	const playAttempt = audio.play();
	if (playAttempt && typeof playAttempt.catch === 'function') {
		playAttempt.catch(function (err) {
			// AbortError = 播放请求被下一次加载/播放打断。此时音频往往紧接着照常开始播，
			// 这里一旦把外观改回「暂停」，就会出现「在播却显示暂停」——所以直接交给
			// play/playing/pause 事件判断，不能用 promise 的结果定外观。
			if (err && err.name === 'AbortError') return;
			if (audio.paused) setPlayUI(false);
			if (err && err.name === 'NotAllowedError') {
				tanChuang('浏览器阻止了自动播放，请再点一次播放', 3000);
			}
		});
	}
}

/**
 * 停止播放
 * @param {boolean} [userAction] 是否是用户自己按的暂停（默认是）。
 *   MV 开始播放时（audioMv.js 的 video.onplay）会用 pauseSong(false) 把音频停掉，
 *   这只是「声音改由视频出」，不代表用户不想听。原来不区分，MV 一播就把 playIntent 清成
 *   false，之后从 MV 切回普通歌曲时，出错逻辑以为用户暂停了 → 不自动跳、要再点一次播放。
 */
function pauseSong(userAction) {
	if (userAction !== false) playIntent = false;
	setPlayUI(false);
	// 暂停了就没声音，封面必须停（MV 接管声音时也走这里）
	setCoverSpin(false);

	audio.pause();
}

// 上一首 
function prevSong() {
	songIndex--;
	if (songIndex < 0) {
		songIndex = songs.length - 1
	}

	// 加载歌曲信息并播放 上、下共同代码放到切换歌曲后那里，load是点击后在对音乐src做切换，有这个才能知道音乐切换了
	loadSong(songs[songIndex]);

	lastChange = "prevSong";
}
// 下一首
function nextSong() {
	songIndex++;

	if (songIndex > songs.length - 1) {
		songIndex = 0;
	}

	loadSong(songs[songIndex]);

	lastChange = "nextSong";
}

// 创建一个MutationObserver实例
const observer = new MutationObserver((mutationsList) => {
	for (let mutation of mutationsList) {
		if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
			// 列表还没分片渲染到当前行时 .musliIng 不存在，这里必须判空，
			// 否则抛 TypeError 中断整个回调，后面的 playSong() 不会执行（表现为切歌卡住没反应）
			const musliIng = document.querySelector('.musliIng');
			if (musliIng) {
				let musliIngOpt = musliIng.style.opacity;
				if (musliIngOpt !== undefined && musliIngOpt !== '') {
					musliIng.style.opacity = parseFloat(musliIngOpt) - 0.5;
					if (musliIngOpt <= 0.5) {
						musliIng.style.opacity = 0.3; // 确保透明度不小于0.3
					}
				} else {
					musliIng.style.opacity = 0.8;
				}
			}

			// src属性发生变化时的处理逻辑 音乐改变
			applyLyrics(songs[songIndex]);

			// 存储正在播放的音乐下标到应用程序
			window.localStorage.setItem('songIndex', songIndex);
			// 换歌了：进度归零（同时记下这条 0 属于这首），别把上一首的进度套到这首上
			writeSavedProgress(0);
			resumePending = false;

			// 对歌词位置做初始化
			lrc.style.transform = `translateY(0px)`;
			if (window.dogLrc) {
				dogLrc.style.transform = `translateY(0px)`;
			}
			listupdate();
			scrollToIng();

			// 不管有没有MV都要更新一下video块区内容
			updateVideo();

			// 用局部变量，别再往全局隐式赋值（原来写的是 musicinfo = findMusic(...)）
			const musicinfo = findMusic(title.textContent);
			// 存在mv且在播放状态就暂停播放
			if (suppressAutoplay) {
				// stopAfterErrors() 探测到可播歌曲后的一次性压制：切过去但保持暂停
				suppressAutoplay = false;
			} else if (musicinfo) {
				// 有 MV 的歌声音由视频出，audio 不会有 playing 事件，所以歌词不会自动回来。
				// 先把提示切成「MV 正在加载中」：线上有 80MB 以上的 MV，要十几秒才就绪，
				// 这段时间没有任何提示的话，界面看着正常、其实既没画面也没声音。
				// 视频真正播起来时由 video.onplay 调 restoreLrc 把歌词换回来。
				showLoading('mv');
				audioMvmain(musicinfo);
			} else {
				// 无 MV 的歌：音频还没到能播的程度，先在歌词位置说明「在加载」，别让人以为已经在播了
				if (audio.readyState < 3) showAudioLoading();
				playSong();
			}
		}
	}
});
// 配置观察选项
const observerConfig = { attributes: true };
/**
 * 开始观察
 * @param {HTMLElement} audio 要监听audio元素
 * @param {const} 配置项
 * @returns {none} 无返回
 */
observer.observe(audio, observerConfig);

let lrcContent
// 歌词存储object
let lrc = document.querySelector('#lrc');

/**
 * 是否正处在「还在加载、还没出声」的状态。
 * 用户要求：只要在加载就要有提示，而且要说清在加载什么——
 * 有 MV 的歌提示「MV 正在加载中」，普通歌提示「音乐正在加载中」；
 * 绝对不能出现「界面什么都没说、封面在转、但没有声音」的状态。
 */
let audioLoading = false;

/**
 * 在歌词位置显示加载提示，并把当前歌词数据留着，等真正出声再渲染。
 * @param {'music'|'mv'} kind 这次加载的是音频还是 MV
 */
function showLoading(kind) {
	// 已经出过声了：这次只是拖进度条/视频短暂缓冲，歌词不能被提示盖掉
	if (songStarted) return;
	audioLoading = true;
	const text = kind === 'mv' ? 'MV 正在加载中…（点击播放按钮直接播放音频）' : '音乐正在加载中…';
	if (lrc) lrc.textContent = text;
	if (window.dogLrc) window.dogLrc.textContent = text;
}

/** 只加载音频时用的简写（waiting 事件等地方调用） */
function showAudioLoading() {
	showLoading('music');
}

/**
 * 音频真正出声（playing）后把歌词恢复出来。
 * 加载期间 getLrc 可能已经把歌词拉回来了（lrcData 有值）只是没渲染，这里直接重建；
 * 万一还没拉回来（网络慢），再请求一次。
 */
function restoreLrc() {
	if (!audioLoading) return;
	audioLoading = false;
	if (lrcData && lrcData.length) {
		createLrcElements();
	} else {
		getLrc(songs[songIndex]);
	}
}
/**
 * 歌词获取
 * @param {string} titC 歌词名称
 * @returns {none} 无返回
 */
function getLrc(titC) {
	lrc.textContent = '加载中...';
	// 元素id会被自动提取到window对象中，所以可以直接使用，但并不是一个合规的标准，所以以后这个功能移除会出问题，需注意。
	if (window.dogLrc) {
		dogLrc.textContent = '加载中...';
	}

	// 确保urlIng变量正确设置
	if (typeof urlIng === 'undefined' || !urlIng) {
		urlIng = window.location.origin;
	}

	// 确保URL不以斜杠结尾，避免双斜杠
	const baseUrl = urlIng.endsWith('/') ? urlIng.slice(0, -1) : urlIng;

	$.get(`${baseUrl}/music/lrc/${titC}.lrc`, function (data) {
		lrcContent = data;
		parseLrc();
	}).fail(function () {
		lrcContent = `[00:00.00]${titC}
[00:03.00]歌词加载错误或暂无歌词
[00:20.00]您也可以联系我们投稿对应歌词
`;
		parseLrc();
	});
}
getLrc(songs[songIndex]);

// 容器高度
var containerHeight = document.querySelector('.container').clientHeight;
var lrcData// = parseLrc();
/**
 * 解析歌词字符串
 * 得到一个歌词对象的数组
 * 每个歌词对象:
 * {time:开始时间, words:歌词内容}
 * @returns {object} result 最终返回一个歌词对象数组
 */
let liHeight;
function parseLrc() {
	if (lrcContent == '') {
		lrcContent = `[00:00.00]${title.textContent}
    [00:03.00] 音乐文件内容为空
    `;
		console.error(`请检查：“${title.textContent}”歌词文件, code: m1`);
	};
	if (lrcContent) {
		var lines = lrcContent.split("\n");
		/**
		 * 最终的歌词对象数组
		*/
		var result = [];
		for (var i = 0; i < lines.length; i++) {
			if (lines[i]) {
				var str = lines[i];
				var parts = str.split(']');
				var timeStr = parts[0].substring(1);// 切割第一个字符也就是这里的[
				if (isNaN(+timeStr[0])) {
					continue; // 第一个字符不是一个数字就结束当前循环并进入下一次循环
				}
				var obj = {
					time: parseTime(timeStr),
					words: parts[1]
				}
				result.push(obj);
			}
		}
		if (result.length < 1) {
			lrcContent = `[00:00.00]${title.textContent}
        [00:03.00] 音乐文件内容有误
        `;
			console.error(`请检查：“${title.textContent}”歌词文件, code: m2`);
			parseLrc(lrcContent);
			return;
		};
		lrcData = result;
		createLrcElements();
		return result;
	} else {
		// lrcContent==false
		// console.log('歌词内容为空，首次加载');// 似乎已解决 但东西还是保留吧
		setTimeout(() => {
			getLrc(songs[songIndex])
		}, 50);
	}
}

/**
 * 将一个时间字符串解析为数字
 * @param {*} timeStr 时间段字符串
 * @returns num
 */
function parseTime(timeStr) {
	var parts = timeStr.split(':');
	return +parts[0] * 60 + +parts[1]
}

/** 
 * 鼠标划入进度条事件
 * 显示一下时间
 * 后面改一下格式
 */
let setTime;
progressContainer.onmouseenter = function () {
	clearInterval(setTime);
	setTimeFun();
	setTime = setInterval(() => {
		setTimeFun();
	}, 1000);
}
progressContainer.onmouseleave = function () {
	clearInterval(setTime);
}
function setTimeFun() {
	// 秒转换分钟00:00:00格式
	let outtime = audio.duration;
	let ingtime = audio.currentTime;
	document.querySelector('.setTime').textContent = ` 当 前 ：${timeToMinute(ingtime)} 总时长：${timeToMinute(outtime)}`;
}
function timeToMinute(times) {
	var t;
	if (times > -1) {
		var hour = Math.floor(times / 3600);
		var min = Math.floor(times / 60) % 60;
		var sec = times % 60;
		if (hour < 10) {
			t = '0' + hour + ":";
		} else {
			t = hour + ":";
		}

		if (min < 10) { t += "0"; }
		t += min + ":";
		if (sec < 10) { t += "0"; }
		t += sec.toFixed(2);
	}
	t = t.substring(0, t.length - 3);
	return t;
}

let frag = document.createDocumentFragment(); //文档片段
/**
 * 创建歌词元素
 */
function createLrcElements() {
	// 音频还在加载：保留「音频加载中…」提示，等 playing 事件再渲染歌词
	if (audioLoading) return;
	lrc.textContent = '';
	/* 优化后，只改一次 dom 树，当然现在这里内容很少，可以不需要做这样的优化 */
	for (var i = 0; i < lrcData.length; i++) {
		var li = document.createElement('li');
		li.textContent = lrcData[i].words;
		frag.appendChild(li);
	}
	/**
	 * cloneFrag  克隆一下原来的值，避免appendChild移动后内容为空
	 * 
	 * nodeObject.cloneNode(include_all)
	 * 
	 * include_all为布尔值，如果为true，那么将克隆原节点，以及所有子节点；为false时，仅复制节点本身
	 * 
	 * 复制后返回的节点副本属于文档所有，但并没有为它指定父节点，需要通过appendChild()、insertBefore()或replaceChild()方法将它添加到文档中
	 */
	let cloneFrag = frag.cloneNode(true);
	lrc.appendChild(frag);

	if (window.dogLrc) {
		dogLrc.textContent = '';
		dogLrc.append(cloneFrag);
	}

	// 记录一行歌词的真实高度，供歌词滚动/高亮使用。
	// 原来在 parseLrc 里算，但「音频加载中」时 createLrcElements 会提前返回、DOM 里没有 li，
	// 那里取值会抛错，所以挪到这里：只要真的渲染了歌词就一定算得到。
	if (lrc.children[0]) {
		liHeight = lrc.children[0].clientHeight;
	}
}

/**
 * 点击最大化弹窗里的某一句歌词 → 从这一句的开始时间继续播放。
 * 只作用于 #dog 里那份克隆出来的歌词（id = dogLrc）：主界面 #lyricPanel 的点击已经被
 * maxScreen.js 占作「打开最大化」，两者不能抢同一个点击，所以主界面保持原样。
 * 用事件委托挂在 dialog 上而不是挂在 ul 上：每次打开弹窗都会重新克隆一份歌词，
 * 挂在 ul 上的监听会随节点一起被换掉。
 */
const dogDialog = document.getElementById('dog');
if (dogDialog) {
	dogDialog.addEventListener('click', function (e) {
		const li = e.target.closest ? e.target.closest('li') : null;
		if (!li || !window.dogLrc || !window.dogLrc.contains(li)) return;
		if (!lrcData || !lrcData.length) return;
		// 克隆出来的 li 都是新节点，只能按「在 ul 里的序号」对上 lrcData 的下标
		const index = Array.prototype.indexOf.call(window.dogLrc.children, li);
		if (index < 0 || !lrcData[index]) return;
		const seekTime = lrcData[index].time;
		if (typeof seekTime !== 'number' || isNaN(seekTime)) return;

		// MV 在播时声音来自 video（此时 audio 被 pauseSong 停着），要跳 video，否则会双声
		const mv = window.audioMvVideo1;
		if (mv && mv.isConnected && !mv.paused) {
			mv.currentTime = seekTime;
			return;
		}
		audio.currentTime = seekTime;
		// 暂停状态下点歌词就直接接着放；不然只跳进度，看起来像没反应
		if (audio.paused) playSong();
	});
}

// 进度条更新
function updateProgress(e) {
	// audio.duration: 音频长度
	// audio.currentTime: 音频播放位置
	// 对象解构操作
	const {
		duration,
		currentTime
	} = e.target;
	// e.target = {
	//     duration: 225,  // 当前音频时间长度 
	//     currentTime:0  // 当前播放时间
	// }
	const progressPercent = (currentTime / duration) * 100
	// 进度条
	progress.style.width = `${progressPercent}%`
}
// 设置进度条
function setProgress(e) {
	// progressContainer代理视图宽度
	const width = this.clientWidth
	// 鼠标点击时处于progressContainer里的水平偏移量
	const clickX = e.offsetX

	// audio.duration: 音频长度
	const duration = audio.duration

	// audio.currentTime: 音频播放位置
	audio.currentTime = (clickX / width) * duration
}
// 事件监听
// 1.播放歌曲
playBtn.onclick = function () {
	if (!musicContainer.classList.contains('play')) {
		playSong();
		return;
	}
	/**
	 * 此时按钮显示「暂停」（播放中外观），但音频并没有在响。分两种：
	 * ① MV 还在加载（还没出声）→ 点一次就直接播音频，不要先按一次暂停、再点一次才播放；
	 * ② MV 已经在放 → 这一下就是「暂停」，真的把视频停掉（原来只暂停了本来就没在响的音频，
	 *    按钮变了、画面还在动）。
	 */
	if (audio.paused && typeof mvIsLoading === 'function') {
		if (mvIsLoading()) {
			playSong(true);
			return;
		}
		if (typeof mvIsPlaying === 'function' && mvIsPlaying()) {
			// 先停画面，再统一播放器状态（音频本来就没在响，pauseSong 只负责外观和播放意图）。
			// 只调 pauseSong 的话画面照动，只 pause 视频的话按钮不会变回「播放」。
			window.audioMvVideo1.pause();
			pauseSong();
			return;
		}
	}
	pauseSong();
}
// 2.切换歌曲
prevBtn.onclick = prevSong
nextBtn.onclick = nextSong

// 3.播放器进度条相关
// 3.1 设置播放进度
progressContainer.onclick = setProgress
// 3.2 进度条更新
audio.ontimeupdate = updateProgress
// 3.3 歌曲结束后自动下一首
audio.onended = function () {
	lastChange === "prevSong" ? prevSong() : nextSong();
}

// 监听a标签点击后如果播放音乐就在新标签页打开
let links = document.querySelectorAll("a");
for (let i = 0; i < links.length; i++) {
	links[i].addEventListener("click", function () {
		if (!audio.paused) {
			// 音乐播放就加新标签也打开
			links[i].target = "_blank";
			// console.log(links[i]);
		}
	});
}

// Chrome for Android 和 Safari for iOS 提供了 navigator.mediaSession API，可以用来监听耳机按钮事件。
// 如果浏览器支持navigator.mediaSession API就可以运行这个东西
let skipTime = 5; // 要跳过的秒数
if ("mediaSession" in navigator) {
	// 下面的示例创建一个新的 media session 并且为它添加监听器
	// 设置媒体会话信息
	navigator.mediaSession.metadata = new MediaMetadata({
		title: songs[songIndex],
		artist: '歌手',// 一些元数据
		album: '专辑名称',
		artwork: [
			{ src: `./music/audio/${songs[songIndex]}.png`, sizes: '96x96', type: 'image/jpeg' } // ,
			// { src: 'albumart.jpg', sizes: '128x128', type: 'image/jpeg' },
			// { src: 'albumart.jpg', sizes: '192x192', type: 'image/jpeg' },
			// { src: 'albumart.jpg', sizes: '256x256', type: 'image/jpeg' },
			// { src: 'albumart.jpg', sizes: '384x384', type: 'image/jpeg' },
			// { src: 'albumart.jpg', sizes: '512x512', type: 'image/jpeg' },
		]
	});
	// 监听媒体按钮事件
	navigator.mediaSession.setActionHandler("play", function () {
		// 处理播放按钮事件
		// audio.play();
		playSong();
		navigator.mediaSession.playbackState = "playing";
	});
	// 监听暂停按钮事件
	navigator.mediaSession.setActionHandler("pause", function () {
		// 处理暂停按钮事件
		pauseSong();
		navigator.mediaSession.playbackState = "Paused";
	});
	navigator.mediaSession.setActionHandler('previoustrack', function () {
		// 处理上一曲按钮事件
		prevSong()
	});
	navigator.mediaSession.setActionHandler('nexttrack', function () {
		// 处理下一曲按钮事件
		nextSong();
	});


	// 这个示例使用了适当的监听器来允许在不同的方向搜寻正在播放的媒体。
	navigator.mediaSession.setActionHandler("seekbackward", (evt) => {
		// 用户点击了“向后搜寻”的媒体按钮
		audio.currentTime = Math.max(audio.currentTime - skipTime, 0);
	});

	navigator.mediaSession.setActionHandler("seekforward", (evt) => {
		// 用户点击了“向前搜寻”的媒体按钮
		audio.currentTime = Math.min(audio.currentTime + skipTime, audio.duration);
	});


	// 要移除一个监听器，将它设为 null。
	// navigator.mediaSession.setActionHandler("nexttrack", null);
} else {
	console.log('浏览器不支持navigator.mediaSession API');
}