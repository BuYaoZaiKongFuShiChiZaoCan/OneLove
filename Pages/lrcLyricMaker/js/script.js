const audio = document.querySelector('audio');


// 设置样式
let main = document.querySelector('main');
main.addEventListener('click', function (e) {
    // 使用e.target来获取点击的元素，然后检查它是否是main的直接子元素。如果不是，你可以向上遍历DOM树，直到找到main的直接子元素为止
    let clickedElement = e.target;
    while (clickedElement !== main) {
        if (clickedElement.parentElement === main) {
            // console.log(clickedElement);
            // 找到了main的直接子元素
            setStyle(clickedElement);
            return;
        }
        clickedElement = clickedElement.parentElement;
    }
});
/**
 * 更改样式
 * @param {Element} e 传入main页面子元素的主要展示的一个元素
 * @returns {none} 无
 */
function setStyle(e) {
    let pagesLength = main.children.length;
    for (let index = 0; index < pagesLength; index++) {
        if (main.children[index].id == e.id) {
            e.classList.add('max');
            e.classList.remove('min');
        } else {
            main.children[index].classList.add('min');
            main.children[index].classList.remove('max');
        }
    }
    // console.log(e);
}

// 第一步 文件选择后进行
window.musicFile.addEventListener('change', (event) => {
    // console.log(event);
    // 设置音乐文件路径
    let file = event.srcElement.files[0];
    let objectUrl = URL.createObjectURL(file);
    document.querySelectorAll('audio')[0].src = objectUrl;
    // 设置音乐文件名为歌曲名Ti
    let MusName = event.target.files[0].name.split('.');
    console.log(MusName);
    if (MusName.length <= 2) {
        window.Ti.value = MusName[0];
        MetadataConfig.Ti = MusName[0];
    } else {
        let musname = '';
        for (let index = 0; index < MusName.length - 1; index++) {
            musname = musname + MusName[index];
        }
        window.Ti.value = musname;
        MetadataConfig.Ti = musname;
    }
    // 到下一步-->歌词编辑
    setStyle(window.歌词编辑);
});

// 第二步 完成编辑
window.loadText.addEventListener('change', function (event) {
    // 创建一个FileReader对象
    var reader = new FileReader();

    // 当文件加载完成时触发的事件
    reader.onload = function (event) {
        // event.target.result 包含了文件的文本内容
        var fileContent = event.target.result;
        // 设置内容
        window.lrcContent.value = fileContent;
    };

    // 读取文件
    reader.readAsText(event.target.files[0]);
    // console.log(reader);
})

document.getElementById('editOver').addEventListener('click', function (e) {
    e.stopPropagation();
    editOver(e);
})
function editOver(e) {
    if (window.lrcContent.value.length > 0) {
        if (musicFile.value.trim().length > 0) {
            let lrcContent = document.querySelector("#lrcContent").value;
            let lines = lrcContent.split("\n");
            let frag = document.createDocumentFragment(); //文档片段
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].length > 0) {
                    // 设置li
                    let li = document.createElement('li');
                    // 创建div父元素设置样式
                    let divM = document.createElement('div');
                    divM.className = 'lrc-text';
                    // 设置div存储歌词基本信息
                    let div = document.createElement('div');
                    div.textContent = lines[i];
                    div.setAttribute('contenteditable', true)
                    // 设置span
                    let span = document.createElement('span');
                    span.textContent = '00:00.0000';
                    span.setAttribute('contenteditable', true)
                    // 添加
                    divM.appendChild(div);
                    divM.appendChild(span);
                    li.appendChild(divM);
                    frag.appendChild(li);
                }
            }
            document.querySelector('#lrcList').innerText = '';
            document.querySelector('#lrcList').appendChild(frag);

            // 设置一下歌词长度
            let duration = timeFormat(audio.duration);
            window.Le.value = duration;
            MetadataConfig.Le = duration;

            window.lrcList.childNodes[0].classList.add('active');

            // to next
            setStyle(window.歌词预览);
        } else {
            // to previous
            setStyle(window.获取音乐);
            alert('选择好音乐再进行下一步吧')
        }
    } else {
        alert('还没有输入歌词哦~');
    }
}

function timeFormat(num) {
    let minutes = Math.floor(num / 60).toString().padStart(2, '0');
    let seconds = (num % 60).toFixed(4).toString();
    let second = (seconds < 10 ? '0' : '') + seconds;// 格式化小数
    return minutes + ":" + second;
}


function removeAllActive() {
    document.querySelectorAll('#lrcList .active').forEach(item => {
        item.classList.remove('active');
    });
}

// 第三步
// window.lrcList.addEventListener("dblclick", function (event) {// 本来用双击可修改元素的，有更方便的方法
// 在这里添加双击事件的处理逻辑
// event.target
// });

// 点击事件出了bug，暂时不用了
/* window.lrcList.addEventListener('click', function (event) {
    event.stopPropagation();
    if (event.target.tagName == 'li') {
        removeAllActive();
        // 检查点击的目标是否是 li 元素或者其子元素
        let targetLi = event.target;
        while (targetLi && targetLi.tagName !== 'li') {
            targetLi = targetLi.parentElement;
        }

        if (targetLi) {
            // 为点击的 li 元素添加 active 类
            targetLi.classList.add('active');
        }
    }
}) */

window.lastItem.addEventListener('click', function () {
    // 获取当前元素
    var currentElement = document.querySelector('#lrcList .active');

    if (currentElement) {
        // 获取父元素
        var parentElement = currentElement.parentNode;

        // 获取父元素的所有子节点
        var children = parentElement.childNodes;

        // 遍历子节点列表，找到当前元素在列表中的位置
        for (var i = 0; i < children.length; i++) {
            if (children[i] === currentElement) {// i就是元素在父元素中的位置
                // 执行到上一条
                children[i].classList.remove('active');
                if (i > 0) {
                    children[i - 1].classList.add('active');
                } else {
                    children[i].classList.add('active');
                }
                break;
            }
        }
    } else {
        document.querySelector('#lrcList').lastChild.classList.add('active');
    }
})

window.tag.addEventListener('click', function (event) {
    event.stopPropagation();
    let details = document.querySelector('details');
    details.open = false;

    // 获取列表最后一个元素
    let lastSpan = document.querySelector('#lrcList>li:last-of-type');
    if (audio.paused) {
        // 判断classList是否包含active
        for (let i = 0; i < lastSpan.classList.length; i++) {
            if (lastSpan.classList[i] == 'active') {
                tagNext();
                return;
            }
        }
        audio.play();
        window.tag.textContent = '打点';
    } else {
        tagNext();
    }
})

function tagNext() {
    let active = document.querySelector('#lrcList .active');

    // 到下一条
    // 将 HTMLCollection 转换为数组
    let childrenArray = Array.from(window.lrcList.children);
    // 然后使用 indexOf 方法 :当前元素下标
    let index = childrenArray.indexOf(active);
    removeAllActive();
    let config = {
        index: window.lrcList.childNodes[index],
        index2: window.lrcList.childNodes[index + 1]
    }
    if (config.index) {
        active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

        window.lrcList.childNodes[index].childNodes[0].childNodes[1].textContent = timeFormat(audio.currentTime);
        if (config.index2) {
            window.lrcList.childNodes[index + 1].classList.add('active');
        } else {
            window.tag.textContent = '下一步';
            console.log('结束2');
        }
    } else {
        if (window.Ti.value.trim().length > 0) {
            if (musicFile.value.trim().length > 0) {
                // 进入下一阶段
                console.log('结束');
                audio.pause();
                setStyle(window.导出歌词);
            } else {
                // to one
                setStyle(window.获取音乐);
                alert('选择好音乐再进行下一步吧')
            }
        } else {
            alert('必须输入歌曲名才能进行下一步哦！')
        }
    }
}

// 第四步
let ExportConfig = {
    leftSpace: 1,
    decimalPlaces: 2
}
document.querySelector('dl').addEventListener('change', (event) => {
    // console.log(event);
    switch (event.target.id) {
        case 'leftSpace':
            ExportConfig.leftSpace = Math.min(Math.max(+event.target.value, 0), 1);
            event.target.value = ExportConfig.leftSpace;
            window.localStorage.setItem('leftSpace', ExportConfig.leftSpace);
            break;
        case 'decimalPlaces':
            ExportConfig.decimalPlaces = Math.min(Math.max(+event.target.value, 0), 4);
            event.target.value = ExportConfig.decimalPlaces;
            window.localStorage.setItem('decimalPlaces', ExportConfig.decimalPlaces);
        default:
            console.log('其它变化');
            break;
    }
    lrcShow();
})
function lrcShow() {
    let lrcshow = `[00:00`;
    // 定义小数位
    if (ExportConfig.decimalPlaces > 0) {
        lrcshow += '.' + '0'.repeat(ExportConfig.decimalPlaces) + ']';
    } else {
        lrcshow += ']'
    }
    // 定义左侧空格
    lrcshow += ' '.repeat(ExportConfig.leftSpace);
    // 定义歌词内容
    lrcshow += '这是一句歌词示例'
    // 显示
    window.LrcPreview.textContent = lrcshow;
}
let MetadataConfig = {
    Ti: document.querySelector('#Ti').value,
    Ar: document.querySelector('#Ar').value,
    Le: document.querySelector('#Le').value,
    Al: document.querySelector('#Al').value,
    Tr: document.querySelector('#Tr').value,
    Ge: document.querySelector('#Ge').value,
    Co: document.querySelector('#Co').value,
    Ye: document.querySelector('#Ye').value,
    LRC: document.querySelector('#LRC').value,
    En: document.querySelector('#En').value,
    Bi: document.querySelector('#Bi').value,
    La: document.querySelector('#La').value,
    Pu: document.querySelector('#Pu').value,
    To: document.querySelector('#To').value,
    So: document.querySelector('#So').value,
    Cp: document.querySelector('#Cp').value,
    St: document.querySelector('#St').value,
    Re: document.querySelector('#Re').value,
    Mood: document.querySelector('#Mood').value,
    Tempo: document.querySelector('#Tempo').value,
    ISRC: document.querySelector('#ISRC').value,
    Eq: document.querySelector('#Eq').value,
    Rv: document.querySelector('#Rv').value,
    Dl: document.querySelector('#Dl').value,
    Vo: document.querySelector('#Vo').value,
}
// 内容改变后更新数据
window.metaMessage.addEventListener('change', function (event) {
    // console.log(event);
    MetadataConfig[event.target.id] = event.target.value;
})
// 时间数组
let ArrayTime = [];
// 歌词内容数组
let ArrayLrc = [];
// 文件内容
let downloadData = '';
window.Export.addEventListener('click', function (event) {
    // 元数据处理、添加
    for (let key in MetadataConfig) {
        if (MetadataConfig[key].length > 0) {
            downloadData += `[${key}: ${MetadataConfig[key]}]\n`
        }
        // console.log(downloadData);
    }
    // 歌词处理
    for (let index = 0; index < window.lrcList.childNodes.length; index++) {
        ArrayLrc.push(window.lrcList.childNodes[index].childNodes[0].childNodes[0].textContent) // 0是歌词，1是时间
        // 这里对时间处理事还应该加上小数点后几位的东西
        if (ExportConfig.decimalPlaces > 0) {
            let a = window.lrcList.childNodes[index].childNodes[0].childNodes[1].textContent.split('.');
            ArrayTime.push(a[0] + '.' + a[1].substring(0, ExportConfig.decimalPlaces))
        } else {
            ArrayTime.push(window.lrcList.childNodes[index].childNodes[0].childNodes[1].textContent.split('.')[0]);
        }
    }

    // 将歌词添加进lrc
    for (let index = 0; index < ArrayTime.length; index++) {
        downloadData += `[${ArrayTime[index]}]${' '.repeat(ExportConfig.leftSpace)}${ArrayLrc[index]}\n`
    }

    if (downloadData.length > 0) {
        if (musicFile.value.trim().length > 0) {
            console.log(downloadData);
            // 下载
            // 创建一个新的 Blob 对象
            var blob = new Blob([downloadData], { type: "application/octet-stream" });
            // 创建一个 URL 对象
            var url = URL.createObjectURL(blob);
            // 创建一个链接让用户下载文件
            var link = document.createElement("a");
            link.href = url;
            link.download = `${MetadataConfig.Ti}.lrc`;
            link.click();

            // 释放 URL 对象
            URL.revokeObjectURL(url);

            // 让用户选择是否刷新页面
            var r = confirm("歌词文件已下载，是否要刷新页面进行下一首歌词制作");
            if (r == true) {
                location.reload();
            }
        } else {
            // to one
            setStyle(window.获取音乐);
            alert('选择好音乐再进行下一步吧')
        }
    } else {
        alert('请先按步骤制作后再导出哦ヾ(ｏ･ω･)');
    }
})

// 页面加载完毕
window.onload = () => {
    if (localStorage.getItem('leftSpace') !== null) {
        ExportConfig.leftSpace = localStorage.getItem('leftSpace');
        window.leftSpace.value = localStorage.getItem('leftSpace');
    }
    if (localStorage.getItem('decimalPlaces') !== null) {
        ExportConfig.decimalPlaces = localStorage.getItem('decimalPlaces');
        window.decimalPlaces.value = localStorage.getItem('decimalPlaces');
    }
    lrcShow();
}

document.onkeydown = function (e) {
    var keyNum = window.event ? e.keyCode : e.which;       //获取被按下的键值  
    if (keyNum == 37) {// 左
        // 音乐进度减少5秒 用户点击了“向后搜寻”的媒体按钮
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
        return;
    }

    if (keyNum == 39) {// 右
        // 音乐进度增加5秒 用户点击了“向前搜寻”的媒体按钮
        if (window.Le.value !== '') {
            audio.currentTime = Math.min(audio.currentTime + 5, window.Le.value);
        }
        alert('选择音乐后再进行操作吧')
        return;
    }
}