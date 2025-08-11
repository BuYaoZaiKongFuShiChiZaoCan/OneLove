const dog = document.querySelector('#dog');
let dogElementing;

/**
 * 关闭最大化窗口
*/
function delMaxScreeen() {
    dog.close();
    // 关闭后清空dog内容
    dog.textContent = '';
}

// 创建一个关闭按钮
function createCloseBtn() {
    // 添加元素到弹框里
    let closeSpan = document.createElement('span');
    closeSpan.textContent = '关闭';
    closeSpan.addEventListener('click', () => delMaxScreeen(dogElementing));
    return closeSpan;
}

// 设置元素需要传入的，设置音乐列表
playlistPanel.addEventListener('click', () => {
    dogElementing = musicList;
    dog.appendChild(createCloseBtn());
    dog.insertAdjacentHTML('beforeend', dogElementing.innerHTML);

    dog.showModal();
    scrollToIng2();// 打开后执行一次滚动
    document.querySelector('#dog #playlistPanel').addEventListener('click', () => {/* playlistPanel在dog里被复制了一次，又是屎山一部分了。。。 */
        scrollToIng2();
    })

    // dog.addEventListener('click', 这种每次点击都会注册一次点击事件，最后每打开一次都有一个点击事件，pass了
    dog.onclick = function (e) { // 用element.onclick事件可以覆盖事件，不会注册两次onclick事件
        e.preventDefault();
        e.stopPropagation();
        // console.log(e.target.id);
        if (e.target.id !== '' && e.target.id !== 'playlistPanel' && e.target.id !== 'dog') {
            if (songIndex == +e.target.id) {
                if (audio.paused) {
                    playSong();
                    // tanChuang('当前歌曲正在播放，可以点击进度条设置音乐进度');
                } else {
                    pauseSong();
                }
            } else {
                // 点击后设置一下当前播放音乐的index，不然songindex还是之前的，到下一首就会以之前播放的音乐为下一首跳转
                songIndex = +e.target.id;
                loadSong(songs[+e.target.id]);
                playSong();
            }
        }
    }
})
// 滚动到正在播放
function scrollToIng2() {
    /* document.querySelector('#dog #playlistPanel').addEventListener('click', () => {
        document.querySelectorAll('.musliIng')[1].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }) */

    // 获取父元素和子元素
    var parentElement = window.dog;
    var childElement = document.querySelectorAll('.musliIng')[1];

    // 计算父元素到子元素的距离
    var distanceToScroll = childElement.offsetTop - (parentElement.clientHeight / 2);

    // 设置父元素的滚动位置
    parentElement.scrollTo({
        top: distanceToScroll,
        behavior: 'smooth'
    })
}

let dogHeight
lyricPanel.addEventListener('click', function () {
    dog.showModal();
    dogElementing = lyricPanel;
    // 添加元素到弹框里
    dog.appendChild(createCloseBtn());
    dog.insertAdjacentHTML('beforeend', dogElementing.innerHTML);
    // 添加完后要将原id改掉
    document.querySelector('#dog #lrc').id = 'dogLrc';
    // 最大化后设置title提示为空


    // 在每次打开最大化窗口时加载窗口高度，高度应用于audio.js的setOffset
    dogHeight = parseInt(dog.clientHeight / 2);
})