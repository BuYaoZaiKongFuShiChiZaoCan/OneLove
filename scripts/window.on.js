// 页面加载时触发
window.onload = function () {
    // 获取音乐的播放时间
    audio.currentTime = window.localStorage.getItem('musicTime');
}

// 页面关闭时候触发
window.onbeforeunload = function () {
    if (document.getElementById("audioMvVideo1")) {
        window.localStorage.setItem('musicTime', +(document.getElementById('audioMvVideo1').currentTime));
    } else {
        window.localStorage.setItem('musicTime', +(audio.currentTime));
    }
}