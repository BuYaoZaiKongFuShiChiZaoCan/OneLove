(function () {
    var a_idx = 0;
    window.onclick = function (event) {
        var a = [
            "富强",
            "(*^▽^*)",
            "变美",
            "民主",
            "(^_−)☆",
            "变富",
            "文明",
            "o(´^｀)o",
            "变强",
            "和谐",
            "o(╥﹏╥)o",
            "变帅",
            "自由",
            "ψ(*｀ー´)ψ",
            "减肥",
            "平等",
            "(•́へ•́╬)",
            "公正",
            "ヽ(ー_ー)ノ",
            "法治",
            "┗( ▔, ▔ )┛",
            "爱国",
            "(ಥ_ಥ)",
            "敬业",
            "(✪ω✪) |ू･ω･` )",
            "诚信",
            "Thanks♪(･ω･)ﾉ",
            "友善",
            "ᕙ༼ ͝°益° ༽ᕗ"
        ];
        var heart = document.createElement("b"); //创建b元素
        heart.onselectstart = new Function('event.returnValue=false'); //防止拖动
        document.body.appendChild(heart).textContent = a[a_idx]; //将b元素添加到页面上
        a_idx = (a_idx + 1) % a.length;
        heart.style.cssText = "position: fixed; left:-100%;"; //给b元素设置样式
        var f = 16, // 字体大小
            x = event.clientX - f / 2, // 横坐标
            y = event.clientY - f, // 纵坐标
            c = randomColor(), // 随机颜色
            a = 1, // 透明度
            s = 1.2; // 放大缩小
        var timer = setInterval(function () { //添加定时器
            if (a <= 0) {
                document.body.removeChild(heart);
                clearInterval(timer);
            } else {
                heart.style.cssText = "font-size:16px;cursor: default;position: fixed;color:" +
                    c + ";left:" + x + "px;top:" + y + "px;opacity:" + a + ";transform:scale(" +
                    s + ");";
                y--;
                a -= 0.016;
                s += 0.002;
            }
        }, 15)
    }
    // 随机颜色
    function randomColor() {
        return "rgb(" + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + "," + (~~(Math.random() * 255)) + ")";
    }
}());