/**
 * 播放进度：保存的时机都在这个文件里，真正的读写逻辑在 scripts/audio.js
 * （saveMusicProgress / writeSavedProgress / readSavedProgress）。
 *
 * ⚠️ 这里原来还有一段 window.onload 恢复进度（audio.currentTime = localStorage.musicTime），
 *    已经移除。原因：<audio> 和 MV 的 <video> 都是 preload="auto"，window.onload 必须等
 *    它们全部预加载完才触发 —— 实测（本地 Chrome 无头）无 MV 的歌要 10.8 秒，有 MV 的歌
 *    （浮夸 86MB）16 秒了还没触发。这段时间里用户点播放，就是从 0 开始，看着完全像
 *    「进度没记住」。现在改由 audio.js 挂在 audio 的 loadedmetadata 上恢复，
 *    音频一拿到时长就跳过去，通常 1 秒内到位。
 */

/**
 * 关页面时保存。
 * 光靠 beforeunload 不够：手机上切到后台、被系统杀进程时它根本不触发，
 * 所以下面再补 pagehide 和 visibilitychange 两个更早的时机。
 */
window.onbeforeunload = function () {
    if (typeof saveMusicProgress === 'function') saveMusicProgress();
};

window.addEventListener('pagehide', function () {
    if (typeof saveMusicProgress === 'function') saveMusicProgress();
});

document.addEventListener('visibilitychange', function () {
    if (document.hidden && typeof saveMusicProgress === 'function') saveMusicProgress();
});
