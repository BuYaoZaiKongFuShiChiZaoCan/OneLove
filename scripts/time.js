// 缓存DOM元素和常量
const s = document.getElementById("second");
const m = document.getElementById("min");
const h = document.getElementById("hour");

// UTC+8时区偏移量（毫秒）
const UTC8_OFFSET = 8 * 60 * 60 * 1000;

// 星期数组
const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

// 缓存桌面端检查
const isDesktop = window.innerWidth >= 1001;

// 获取UTC+8时区的日期对象
function getUTC8Date() {
    return new Date(Date.now() + UTC8_OFFSET);
}

// 格式化数字为两位数
const padZero = num => num.toString().padStart(2, '0');

// 设置日期显示
function setDate() {
    const utc8Date = getUTC8Date();
    const zifu = WEEKDAYS[utc8Date.getUTCDay()];
    const nian = utc8Date.getUTCFullYear();
    const yue = utc8Date.getUTCMonth() + 1;
    const ri = utc8Date.getUTCDate();

    const wzdayText = `${nian}/${padZero(yue)}/${padZero(ri)} ${zifu}`;
    
    // 添加错误处理
    if (window.dateText) {
        window.dateText.textContent = wzdayText;
    }
}

// 更新时间显示
function updateTime() {
    const utc8Date = getUTC8Date();
    const snum = utc8Date.getUTCSeconds();
    const mnum = utc8Date.getUTCMinutes() + snum / 60;
    const hnum = utc8Date.getUTCHours() + mnum / 60;

    // 设置数字时间（添加错误处理）
    const timeElements = {
        hourText: padZero(parseInt(hnum)),
        minuteText: padZero(parseInt(mnum)),
        secondText: padZero(snum)
    };

    Object.entries(timeElements).forEach(([key, value]) => {
        if (window[key]) {
            window[key].textContent = value;
        }
    });

    // 桌面端设置指针旋转
    if (isDesktop && s && m && h) {
        s.style.transform = `rotate(${snum * 6}deg)`;
        m.style.transform = `rotate(${mnum * 6}deg)`;
        h.style.transform = `rotate(${hnum * 30}deg)`;
    }
}

// 初始化
setDate();
setInterval(updateTime, 1000);