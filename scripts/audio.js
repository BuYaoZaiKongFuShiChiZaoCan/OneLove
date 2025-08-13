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
let songIndex = +window.localStorage.getItem('songIndex');

// 向页面输出音乐数量
document.getElementById('playlistLength').textContent = songs.length;
function listupdate() {
    const musicDivs = window.musicList.getElementsByTagName('div');
    songs.forEach((song, index) => {
        if (songIndex === index) {// 不能使用songs[songIndex]了，因为有可能歌词名重复时会有两个正在播放的音乐导致显示等bug，只能用当前播放音乐下标去判断
            // 设置正在播放的歌曲列表样式
            musicDivs[index + 1].classList.add('musliIng');
        } else {
            // 恢复其它的样式
            musicDivs[index + 1].classList.remove('musliIng');
        }
    });

    // 当dog显示时更新dog内歌词列表样式
    if (document.querySelector('#dog #playlistPanel')) {
        const dogMusicDivs = dog.getElementsByTagName('div');
        songs.forEach((song, index) => {
            if (songIndex === index) {
                // 设置dog内正在播放的歌曲列表样式
                dogMusicDivs[index + 1].classList.add('musliIng');
            } else {
                // 恢复dog其它的样式
                dogMusicDivs[index + 1].classList.remove('musliIng');
            }
        });
    }
}

// 输出列表，使用更高阶的分时函数去封装，也就是不让这个插入元素时阻塞浏览器渲染，分段去渲染，回到16.6ms渲染一次的状态
function performChunk(datas) {
    if (datas.length === 0) {
        return;
    }
    let i = 0;
    // 开启下一个分片的执行
    function _run() {
        if (i >= datas.length) {// 大于了也就是输出结束了
            listupdate();
            scrollToIng();
            return;
        }
        // 一个渲染帧中，空闲时开启分片执行
        requestIdleCallback((idle) => {
            // 得到当前这一帧剩余多少毫秒 idle.timeRemaining()
            let fragment = document.createDocumentFragment();
            while (idle.timeRemaining() > 0 && i < datas.length) {
                let div = document.createElement('div');
                div.id = i;
                let span = document.createElement('span');
                span.classList.add('musicItem');
                span.textContent = (i + 1) + '.';
                div.appendChild(span);
                div.appendChild(document.createTextNode(songs[i]));
                fragment.appendChild(div);
                i++;
            }
            musicList.appendChild(fragment);
            // 此次分片完成
            _run();
        });
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
// 音乐加载错误
function MusicError() {
    errorCount++;
    if (errorCount > 3) {
        tanChuang('加载错误次数过多，已暂停', 2000);
        pauseSong();
        errorCount = 0;
        return;
    }
    clearTimeout(mErrTimeout);
    title.textContent = '已暂停';
    mErrTimeout = setTimeout(() => {
        let playIconClassList = playBtn.querySelector('i.fas').classList;
        if (playIconClassList.contains('fa-pause')) {
            lastChange === "prevSong" ? prevSong() : nextSong();
        } else if (playIconClassList.contains('fa-play')) {
            tanChuang('已暂停自动切换', 3700)
        }
    }, 2000)
}
audio.addEventListener('error', MusicError);

// 更新歌曲细节
function loadSong(song) {
    title.textContent = song;
    audio.src = `music/${song}.mp3`;
    musicCover.src = `music/audio/${song}.png`;
}
loadSong(songs[songIndex]);

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

    // 计算父元素到子元素的距离
    var distanceToScroll = childElement.offsetTop - (parentElement.offsetTop * 1.2);// 默认是直接滚到顶部，*1.1就是多往下滚动一行，也就到了top位置，*1.2就滚动了两行，在这里也就是滚动到中间，因为css设置高度只够显示3行

    // 设置父元素的滚动位置
    parentElement.scrollTo({
        top: distanceToScroll,
        behavior: 'smooth'
    })
}

// 播放歌曲
function playSong() {
    if (window.audioMvVideo1) {
        audioMvVideo1.pause();
    }

    // 清除错误超时
    clearTimeout(mErrTimeout);
    audio.play();
    // 元素添加类名
    musicContainer.classList.add("play");
    playBtn.querySelector('i.fas').classList.remove('fa-play');
    playBtn.querySelector('i.fas').classList.add('fa-pause');

    // 如果因为错误暂停就自动下一首
    if (title.textContent == '已暂停') {
        nextSong();
    }
}

// 停止播放
function pauseSong() {
    musicContainer.classList.remove('play');
    playBtn.querySelector('i.fas').classList.add('fa-play');
    playBtn.querySelector('i.fas').classList.remove('fa-pause');

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
            let musliIng = document.querySelector('.musliIng');
            let musliIngOpt = musliIng.style.opacity;
            if (musliIngOpt !== undefined && musliIngOpt !== '') {
                musliIng.style.opacity = parseFloat(musliIngOpt) - 0.2;
                if (musliIngOpt <= 0.2) {
                    musliIng.style.opacity = 0.2; // 确保透明度不小于0.2
                }
            } else {
                musliIng.style.opacity = 0.8;
            }

            // src属性发生变化时的处理逻辑 音乐改变
            getLrc(songs[songIndex]);

            // 存储正在播放的音乐下标到应用程序
            window.localStorage.setItem('songIndex', songIndex);
            // 设置播放进度
            window.localStorage.setItem('musicTime', 0);

            // 对歌词位置做初始化
            lrc.style.transform = `translateY(0px)`;
            if (window.dogLrc) {
                dogLrc.style.transform = `translateY(0px)`;
            }
            listupdate();
            scrollToIng();

            // 不管有没有MV都要更新一下video块区内容
            updateVideo();

            // 存在mv且在播放状态就暂停播放
            if (musicinfo = findMusic(title.textContent)) {
                // Mv 有MV的歌曲会切换后会优先自动播放MV
                audioMvmain(musicinfo);
            } else {
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

        // 设置li高度
        liHeight = lrc.children[0].clientHeight;
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
    musicContainer.classList.contains('play') ? pauseSong() : playSong()
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