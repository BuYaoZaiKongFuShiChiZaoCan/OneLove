const secondsaudio = document.querySelector('#seconds');
const a_paused = document.querySelector('#secondPaused');
const timediv = document.querySelector('#time');

/**
 * 秒针声音控制
 */
let sa_paused = false
function playseconds() {
    if (audio.paused) {
        if (sa_paused) {
            secondsaudio.play()
        }
    } else {
        window.clearInterval(sil);
        sa_paused = false;
        tanChuang('正在播放音乐，秒针声音已暂停');
    }
}

let sil;// 定时器

// 点击开关后
a_paused.onclick = 开关;
// 点击元素后设置开关
timediv.onclick = 开关;
function 开关() {
    if (sa_paused && audio.paused) {
        a_paused.innerText = '秒针声音：关(默认)';
        clearInterval(sil);
        sa_paused = false;
    } else {
        a_paused.innerText = '秒针声音：开';
        sil = setInterval(() => {
            playseconds()
        }, 1000);
        sa_paused = true;
    }
}


/**
 * 报时声音控制
 */

/**
 * 整点报时声音控制
 */