// 更新歌词滚动和样式的主函数
function updateLyrics() {
    const index = findIndex();
    const validIndex = Math.max(0, index);

    const offset = lrc.childNodes[validIndex] ? lrc.childNodes[validIndex].offsetTop - 20 : 0;

    if (Yindex !== validIndex) {
        Yindex = validIndex;
        const finalOffset = Math.max(0, offset);

        requestAnimationFrame(() => {
            /**
             * 主界面：鼠标停在歌词上时不抢滚动（用户可能正在看/手动滚）。
             * 最大化弹窗（#dog）：必须始终跟随。
             * 原来两者共用 lyricPanelMouse 这一个开关 —— 点主界面歌词打开最大化以后，
             * 鼠标根本没离开原来那个位置，mouseleave 不会触发，开关一直是 true，
             * 于是最大化里的歌词再也不跟着滚了（用户报的「最大化歌词不滚动」就是这个）。
             */
            if (!lyricPanelMouse) {
                lyricPanel.scroll(0, finalOffset);
            }
            if (window.dogLrc) {
                /**
                 * 最大化窗口里的歌词行高与主界面不一样（28.6px vs 23px），
                 * 拿主界面那句算出来的 offsetTop 去滚 dog，行高差会随句数累积，
                 * 表现就是「越到后面当前句越靠下」。这里直接用当前句相对窗口的实时位置
                 * 反推目标滚动量（每一句都重新对齐，误差不会往下传）。
                 * 底部留白由 max.css 的 #dog>#dogLrc padding-bottom 提供，
                 * 否则最后几句物理上滚不到中线。
                 */
                const li = window.dogLrc.children[validIndex];
                if (li) {
                    const liRect = li.getBoundingClientRect();
                    const dogRect = dog.getBoundingClientRect();
                    const abs = dog.scrollTop + (liRect.top + liRect.height / 2) - (dogRect.top + dog.clientHeight / 2);
                    dog.scroll(0, Math.max(0, abs));
                }
            }
        });
    }

    // 更新 lrc 内的歌词样式
    updateLyricStyles(lrc, validIndex);

    // 更新 window.dogLrc 内的歌词样式
    if (window.dogLrc) {
        updateLyricStyles(window.dogLrc, validIndex);
    }
}

/**
 * 计算出，在当前播放器播放到第几秒的情况下
 * lrcData数组中，应改高亮显示的歌词下标
 * 在0秒时不显示任何数据，也就是返回-1,
 */
function findIndex() {
    // 播放器当前时间
    const currentTime = audio.currentTime;
    if (lrcData) {
        for (let i = 0; i < lrcData.length; i++) {
            if (lrcData[i].time > currentTime) {
                return i - 1
            }
        }
        // 找遍了都没找到（说明播放到最后一句），就返回最后一句，不然会是undefined
        return lrcData.length - 1
    }
}

// 更新歌词样式的辅助函数
function updateLyricStyles(container, index) {
    const activeLi = container.querySelector('.active');
    if (activeLi) {
        activeLi.classList.remove('active');
        activeLi.classList.add('visited');
    }

    const currentLi = container.children[index];
    if (currentLi) {
        currentLi.classList.add('active');
        currentLi.style.height = liHeight;
    }
}

/**
 * 动画循环函数
 * 加两处保护：
 * 1) try/catch —— 原来 updateLyrics() 一抛错，后面的 requestAnimationFrame 就排不上，
 *    整条循环永久停住，直到下次 play 事件才可能恢复（表现就是「歌词不跟着滚了」）。
 * 2) lrcLoopRunning 标志 —— 循环因为暂停而退出时置回 false，play/playing/seeking 都能重新拉起，
 *    不必依赖某一个事件一定要触发。
 */
let lrcLoopRunning = false;
function animationLoop() {
    if (audio.paused || audio.ended) {
        lrcLoopRunning = false;
        return;
    }
    try {
        updateLyrics();
    } catch (err) {
        console.error('歌词更新出错：', err);
    }
    requestAnimationFrame(animationLoop);
}
function startLrcLoop() {
    if (lrcLoopRunning) return;
    lrcLoopRunning = true;
    requestAnimationFrame(animationLoop);
}

/**
 * 设置偏移量
 */
let Yindex = 0;
let lyricPanelMouse = false;
window.lyricPanel.onmouseover = function () {// 鼠标移入后包括滚动时执行
lyricPanelMouse = true;
}
window.lyricPanel.onmouseleave = function () {// 鼠标移出时执行
lyricPanelMouse = false;
    // 悬停期间 Yindex 已经一路更新到当前句，直接调 updateLyrics 不会触发滚动，
    // 强制让 Yindex 失配一次，把主界面歌词拉回当前句
    Yindex = -1;
    updateLyrics()
}

// 当音频开始播放时启动动画循环
audio.addEventListener('play', function () {
    startLrcLoop();
});
// 播放真正出声、以及拖进度条之后，都确保循环在跑（循环万一断了也能自己接上）
audio.addEventListener('playing', function () {
    startLrcLoop();
});
audio.addEventListener('seeking', function () {
    if (!audio.paused) startLrcLoop();
});

// 当音频暂停或结束时停止动画循环
audio.addEventListener('pause', () => {
    // 这里不需要额外操作，animationLoop 会自行停止
});

audio.addEventListener('ended', () => {
    // 这里不需要额外操作，animationLoop 会自行停止
});