// UTC+8时区偏移量（毫秒）
const QINGMING_UTC8_OFFSET = 8 * 60 * 60 * 1000;

// 获取UTC+8时区的日期对象
function getUTC8Date() {
    return new Date(Date.now() + QINGMING_UTC8_OFFSET);
}

// 获取当前时间（UTC+8时区）
const date = getUTC8Date();
const year = date.getUTCFullYear();
const yue = date.getUTCMonth(); // 获取当前月份(0-11,0代表1月)
const ri = date.getUTCDate(); // 获取当前日(1-31)

// 清明节的日期规律：大部分年份是4月5日，闰年后的第1年是4月4日
const getQinMingJieDate = year => isLeapYear(year - 1) ? '0404' : '0405';

// 判断是否是闰年
const isLeapYear = year => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

// 清明节日期检查
const isQingMingDay = (month, day) => month === 3 && (day === 4 || day === 5);

// 应用灰度效果
function applyGrayscale() {
    const htmlElement = document.documentElement;
    if (htmlElement) {
        htmlElement.style.filter = "grayscale(1)";
    }
}

// 判断4月4号或5号 (注意：getMonth()返回0-11，所以4月是3)
if (isQingMingDay(yue, ri)) {
    const qingMingDate = getQinMingJieDate(year);
    const currentDate = `0${yue + 1}${ri.toString().padStart(2, '0')}`;
    
    if (currentDate === qingMingDate) {
        applyGrayscale();
    }
}