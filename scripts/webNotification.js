/**
 * 发送通知
 * @param {string} title 通知的标题
 * @param {object} content
 * @param {string} content.body 通知内容
 * @param {number[]} content.vibrate 震动，填入[300, 100, 300], 表示设备振动 300毫秒，然后停止100毫秒，再振动300毫秒
 * @param {string} content.icon 通知图标
 * @param {string} content.tag tag属性表示通知的标签，同一个标签的会覆盖
 * @param {boolean} content.silent 静音
 * @param {number} content.timestamp 通知显示/创建时间
 * @param {boolean} content.noscreen 禁止通知显示在屏幕上
 * @param {string} content.renotify 重复通知
 * @returns {null} 无返回
 */
function sendNotification(title = "标题", content = { body: "内容", vibrate: [300, 100, 300], icon: './images/logo.png', tag: 'tag', silent: false, timestamp: new Date().getTime(), noscreen: true, renotify: false }) {
    const notification = new Notification(title, {
        body: content.body,
        vibrate: content.vibrate,
        icon: content.icon,
        tag: content.tag,
        silent: content.silent,
        timestamp: content.timestamp,
        noscreen: content.noscreen,
        renotify: content.renotify
    });
    
    // 点击通知
    notification.addEventListener('click', function () {
        window.open(window.location.href); // 打开网站
        notification.close();
    });
    
    // 关闭通知
    notification.addEventListener('close', function () {
        console.log('通知已关闭');
    });
}
if (window.Notification.permission == "granted") { // 判断是否有权限
    sendNotification();
} else if (window.Notification.permission != "denied") {
    window.Notification.requestPermission(function (permission) { // 没有权限发起请求
        sendNotification();
    });
}
setTimeout(() => {
    sendNotification("测试通知", { body: "测试内容" });
}, 9000);