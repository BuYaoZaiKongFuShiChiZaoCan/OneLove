// 页面加载时触发
window.onload = function () {
    // 获取音乐的播放时间
    // ⚠️ localStorage 里可能是 null/空串/非数字，直接赋给 currentTime 会得到 NaN
    let savedTime = parseFloat(window.localStorage.getItem('musicTime'));
    if (isFinite(savedTime) && savedTime > 0) {
        audio.currentTime = savedTime;
    }
}

// 页面关闭时候触发
window.onbeforeunload = function () {
    if (document.getElementById("audioMvVideo1")) {
        window.localStorage.setItem('musicTime', +(document.getElementById('audioMvVideo1').currentTime));
    } else {
        window.localStorage.setItem('musicTime', +(audio.currentTime));
    }
}