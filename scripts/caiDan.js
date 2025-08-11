setTimeout(() => {
  const localHosts = ['127.0.0.1', 'localhost', '0.0.0.0'];
  if (!localHosts.some(host => origin.includes(host))) {
    console.clear();
  }
  console.group('caiDan');
  console.log(
    /* 1、彩灯  2、招募 */
    `%c✨ 点击链接加入我们：https://pd.qq.com/s/fk7w6303n\n` +/* document.getElementById("caiDeng").value = 彩灯时间,单位毫秒不用写单位\n */
    `音乐搜索使用浏览器自带的搜索功能（CTRL+F）来查找自己想听的音乐，当前播放列表共${songs.length}首音乐\n` + // 原共1293首
    `右上角搜索框输入QQ号点头像有惊喜哦~\n` +
    `点击闹钟区域开启关闭秒针声音，使用“sa_paused”变量设置值为“false”设置秒针声音关闭`,
    "font-size:20px; background:#FFF; color:#581845;padding:10px; border: 3px solid #581845;border-radius:10px;",
  );
  console.log(
    /* share		分享
    publish		发布
    resource		资源
    Our own		我们 自己的
    wall    墙 */
    `
 /$$$$$$$   /$$$$$$    /$$$$$$     /$$$$$
/$$_____/  /$$__  $$  /$$___ $$   |$$   $$
| $$$$$$  | $$  \\ $$  |$$   \\__/  |$$   $$
\\____  $$ | $$  | $$  |$$         |$$   $$
/$$$$$$$/ | $$$$$$$/  |$$         | $$$$
|_______/ | $$____/   |__/        \\______/
          | $$
          | $$
          |__/
`
  );
  console.groupEnd('caiDan');
}, 0);