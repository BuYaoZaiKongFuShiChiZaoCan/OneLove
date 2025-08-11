let fwl = document.getElementById("visitCount")

// 添加
if (window.localStorage.getItem('fwllocal') == null) {
    localStorage.setItem('fwllocal', 1)
    fwl.innerText = '恭喜发现新世界！'
} else {
    let num = Number(localStorage.getItem('fwllocal')) + 1
    // 更新数值
    localStorage.setItem('fwllocal', num)
    // 设置显示数值
    fwl.innerText = localStorage.getItem('fwllocal')
}