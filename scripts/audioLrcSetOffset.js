// 更新歌词滚动和样式的主函数
function updateLyrics() {
    const index = findIndex();
    const validIndex = Math.max(0, index);

    const offset = lrc.childNodes[validIndex] ? lrc.childNodes[validIndex].offsetTop - 20 : 0;

    if (Yindex !== validIndex && !lyricPanelMouse) {
        Yindex = validIndex;
        const finalOffset = Math.max(0, offset);

        requestAnimationFrame(() => {
            lyricPanel.scroll(0, finalOffset);
            if (window.dogLrc) {
                dog.scroll(0, finalOffset - dogHeight / 2);
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

// 动画循环函数
function animationLoop() {
    if (!audio.paused && !audio.ended) {
        updateLyrics();
        requestAnimationFrame(animationLoop);
    }
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
    updateLyrics()
}

// 当音频开始播放时启动动画循环
audio.addEventListener('play', () => {
    requestAnimationFrame(animationLoop);
});

// 当音频暂停或结束时停止动画循环
audio.addEventListener('pause', () => {
    // 这里不需要额外操作，animationLoop 会自行停止
});

audio.addEventListener('ended', () => {
    // 这里不需要额外操作，animationLoop 会自行停止
});