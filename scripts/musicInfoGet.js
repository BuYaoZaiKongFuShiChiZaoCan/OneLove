// 歌曲名称列表
const songNames = [
    "DJ马哥 - C哩C哩",
    "Gamper & Dadoni、Ember Island - Creep",
    "Mike Zhou - The Dawn (亡灵序曲完美钢琴版)",
    "乌兰图雅、师鹏、沙溢、胡可、云朵、云飞 - 歌舞：点赞新时代 (Live)",
    "于溪悦 - 万爱千恩",
];

// 模拟浏览器头部信息
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Referer": "https://music.163.com/",
};

// 获取歌曲信息
async function getSongInfo(songName) {
    const url = `https://music.163.com/api/search/get?s=${songName}&type=1&offset=0&limit=5`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    const songList = data.result.songs;
    return songList;
}

// 选择歌曲设置id
function setSongId(songList) {
    // 列表第一个元素的id
    const songId = songList[0].id;
    return songId;
}

// 歌词获取
async function getLrc(songId) {
    const lrcUrl = `https://music.163.com/api/song/lyric?os=pc&id=${songId}&lv=-1&tv=-1`;
    const response = await fetch(lrcUrl);
    const lrcData = await response.json();
    const lrc = lrcData.lrc.lyric;
    return lrc;
}

// 保存歌词到lrc_files
function saveLrc(lrc, songName) {
    const blob = new Blob([lrc], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `lrc_files/${songName}.lrc`);
}

function MtoGetLrc() {
    const songInfo = getSongInfo(songName);
    const songId = setSongId(songInfo);
    console.log(`歌曲ID：${songId}`);
    const lrc = getLrc(songId);
    saveLrc(lrc, songName);
    console.log(`${songName}歌词保存成功！`);
    console.log(`保存位置：lrc_files/${songName}.lrc`);
}
// 根据歌曲信息请求图片
function getPic(songInfo) {
    return songInfo[0].artists[0].img1v1Url;
}

function MtoGetPic(MT) {
    let minfo = getSongInfo(MT);
    console.log(minfo);
    let pic = getPic(minfo);
    console.log(pic);
}