// 我的版本记录在changelog.js文件中，你需要更具项目进度修改，时间运行终端Get-Date -Format "yyyy-MM-dd HH:mm:ss"获取最新时间精确到秒。终端不支持&&符号，需要请分两次执行。不要用1)这种序号，像前面一样描述就行。然后阅读OneLove项目开发指南.md和项目及关联文件了解项目进度
const versionLogs = [
    {
        "version": "v1.0",
        "order": 1,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "上传基本网站，第一版[无备份]"
            }
        ]
    },
    {
        "version": "v2.0",
        "order": 2,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "整体UI优化"
            }
        ]
    },
    {
        "version": "v2.3",
        "order": 3,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "上传轮播图"
            }
        ]
    },
    {
        "version": "v2.4.0",
        "order": 4,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "鼠标点击页面弹出文字"
            }
        ]
    },
    {
        "version": "v2.4.1",
        "order": 5,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "鼠标划入导航放大效果"
            }
        ]
    },
    {
        "version": "v2.4.2",
        "order": 6,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "整体界面优化、加入温馨提示"
            }
        ]
    },
    {
        "version": "v2.5",
        "order": 7,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "main内容区优化，并为最后一块内容加上语录"
            }
        ]
    },
    {
        "version": "v2.6",
        "order": 8,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "增加小灰机[至4.0版本已移除]"
            }
        ]
    },
    {
        "version": "v2.7",
        "order": 9,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "增加联系我功能，优化小飞机Bug上传基本网站[无备份]上传基本网站[无备份]"
            }
        ]
    },
    {
        "version": "v2.7.1",
        "order": 10,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "网页窗口宽度大于600像素时，网页部分控件修改"
            }
        ]
    },
    {
        "version": "v2.8",
        "order": 11,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "添加必应搜索功能"
            }
        ]
    },
    {
        "version": "v2.8.1",
        "order": 12,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "小灰机修改，随时间渐变小飞机"
            }
        ]
    },
    {
        "version": "v2.9",
        "order": 13,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "404页面配置"
            }
        ]
    },
    {
        "version": "v2.10",
        "order": 14,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "页面背景音乐（目前设置了十首音乐且随机播放）"
            }
        ]
    },
    {
        "version": "v2.10.1",
        "order": 15,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "背景音乐bug修复，打算为控制台增加小惊喜"
            }
        ]
    },
    {
        "version": "v2.10.2",
        "order": 16,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "音乐播放完毕事件，音乐标签设置到行内"
            }
        ]
    },
    {
        "version": "v2.11",
        "order": 17,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "增加软件/好文推荐，界面美化，音乐整体优化，增加控制按钮，图片压缩加快页面加载速度"
            }
        ]
    },
    {
        "version": "v2.11.1",
        "order": 18,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "增加前端学习路线、离开页面标题改变"
            }
        ]
    },
    {
        "version": "v3.2",
        "order": 19,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "切换音乐路径，音乐文件上传至七牛云"
            }
        ]
    },
    {
        "version": "v3.3",
        "order": 20,
        "time": "",
        "content": [
            {
                itemTime: "",
                itemContent: "注释保留"
            },
            {
                itemTime: "",
                itemContent: "备份版本"
            }
        ]
    },
    {
        "version": "v3.4",
        "order": 21,
        "time": "2023/02/15 17:00",
        "content": [
            {
                itemTime: "",
                itemContent: "更新readme.md文件"
            },
            {
                itemTime: "",
                itemContent: "去掉大部分注释代码"
            },
            {
                itemTime: "",
                itemContent: "移除width<850px时的动画"
            },
            {
                itemTime: "",
                itemContent: "uniCloud收费，以下功能已失效移除：<br />①恋爱记<br />②同学录<br />③留言板1<br />④留言板2"
            },
            {
                itemTime: "",
                itemContent: "因音乐封面修改从api获取有延迟，封面更新速度有所下降"
            }
        ]
    },
    {
        "version": "v3.5",
        "order": 22,
        "time": "2023/02/22 23:00",
        "content": [
            {
                itemTime: "",
                itemContent: "增加音乐列表粘性定位"
            },
            {
                itemTime: "",
                itemContent: "增加歌词（api经常不好，所以大多数时间都是没有歌词的）"
            }
        ]
    },
    {
        "version": "v3.5.1",
        "order": 23,
        "time": "2023/04/26",
        "content": [
            {
                itemTime: "",
                itemContent: "同下"
            }
        ]
    },
    {
        "version": "v3.5.2",
        "order": 24,
        "time": "2023/04/27",
        "content": [
            {
                itemTime: "",
                itemContent: "更新音乐路径不再从七牛云获取"
            }
        ]
    },
    {
        "version": "v3.5.3",
        "order": 25,
        "time": "2023/05/11",
        "content": [
            {
                itemTime: "",
                itemContent: "代码优化，切换音乐歌词位置调整"
            }
        ]
    },
    {
        "version": "v3.6",
        "order": 26,
        "time": "2023/07/27",
        "content": [
            {
                itemTime: "",
                itemContent: "歌词重构"
            }
        ]
    },
    {
        "version": "v3.6.1",
        "order": 27,
        "time": "2023/08/06",
        "content": [
            {
                itemTime: "",
                itemContent: "歌词优化"
            }
        ]
    },
    {
        "version": "v3.7",
        "order": 28,
        "time": "2023/08/20",
        "content": [
            {
                itemTime: "",
                itemContent: "歌词获取调整，改用GitHub仓库获取"
            },
            {
                itemTime: "",
                itemContent: "优化网页加载速度"
            },
            {
                itemTime: "",
                itemContent: "nav icon更新"
            }
        ]
    },
    {
        "version": "v3.7.1",
        "order": 29,
        "time": "2023/08/25",
        "content": [
            {
                itemTime: "",
                itemContent: "歌词bug优化"
            },
            {
                itemTime: "",
                itemContent: "后续将增加歌词"
            }
        ]
    },
    {
        "version": "v3.8",
        "order": 30,
        "time": "2023/09/06",
        "content": [
            {
                itemTime: "",
                itemContent: "加入秒针声音控制，使用\"sa_paused\"变量控制秒针声音的开启和关闭，值为\"true\"、\"false\""
            },
            {
                itemTime: "",
                itemContent: "歌词列表最大化"
            },
            {
                itemTime: "",
                itemContent: "正在播放的音乐在歌词列表特别显示"
            },
            {
                itemTime: "",
                itemContent: "更新了列表点击后如果音乐是暂停状态先播放再弹窗提示，否则暂停播放音乐"
            }
        ]
    },
    {
        "version": "v3.8.1",
        "order": 31,
        "time": "2023/12/03",
        "content": [
            {
                itemTime: "",
                itemContent: "更新了留言和音乐列表<ol type='a'><li>留言增加100多条</li><li>音乐增加至110首</li></ol>"
            },
            {
                itemTime: "",
                itemContent: "加入PWA"
            },
            {
                itemTime: "",
                itemContent: "增加监听a标签点击后如果音乐播放状态就在新标签页打开这个链接"
            },
            {
                itemTime: "",
                itemContent: "音乐lrc优化，增加变量urlIng为window.location.host，并从获取到的当前网址去获取lrc"
            },
            {
                itemTime: "",
                itemContent: "歌词滚动原本transform替换为scroll，并增加onmouse事件增加体验"
            },
            {
                itemTime: "",
                itemContent: "给所有元素都增加scroll-behavior: smooth;使得锚点跳转时和滚动条滚动时会有一个过渡动画，不那么生硬"
            },
            {
                itemTime: "",
                itemContent: "增加点击歌词的length的span标签后定位到当前播放的音乐列表"
            },
            {
                itemTime: "",
                itemContent: "img增加loading属性懒加载优化性能"
            },
            {
                itemTime: "",
                itemContent: "适当调整图片大小，节省移动数据网络流量并缩短加载用时"
            }
        ]
    },
    {
        "version": "v3.9",
        "order": 32,
        "time": "2023/12/10",
        "content": [
            {
                itemTime: "",
                itemContent: "首页底部页面跳转优化"
            },
            {
                itemTime: "",
                itemContent: "页面内容更新"
            },
            {
                itemTime: "",
                itemContent: "秒针声音与歌曲声音冲突bug优化"
            }
        ]
    },
    {
        "version": "v3.9.1",
        "order": 33,
        "time": "2023.12.23",
        "content": [
            {
                itemTime: "",
                itemContent: "使用dialog来展示最大化窗口，在audio.js更新代码会再次去更新dialog里的代码，在最大化时等于执行时歌词更新了两遍，但使用体验优化"
            },
            {
                itemTime: "[12.20D]",
                itemContent: "<ol><li>增加加载动画[13:24M]</li><li>去掉首页css用不到的字体图标加载，提升网页加载速度。[17:51M]</li></ol>"
            },
            {
                itemTime: "[12.21D EVEN]",
                itemContent: "增加navigator.mediaSession耳机按钮事件 [实验性功能、跟浏览器和不同耳机都会影响使用]"
            },
            {
                itemTime: "[12.21D EVEN]",
                itemContent: "去掉dialog在focus-visible状态下outline有边框线问题"
            },
            {
                itemTime: "[12.23D 10.00M]",
                itemContent: "移除搜索框autofocus功能，避免影响音乐的快捷键"
            },
            {
                itemTime: "[12.23D 10.10M]",
                itemContent: "搜索框快捷键 [ Alt + K ]"
            }
        ]
    },
    {
        "version": "v3.9.3",
        "order": 34,
        "time": "2024.01.03",
        "content": [
            {
                itemTime: "[01.03D 00.24M]",
                itemContent: "dialog歌词使用体验优化"
            },
            {
                itemTime: "[01.03D 13.44M]",
                itemContent: "dogLrc歌词滚动效果"
            },
            {
                itemTime: "[01.03D 13.44M]",
                itemContent: "audio.js使用mediaSession API设置耳机控制音乐事件 [Chrome for Android And Safari for iOS 提供了 navigator.mediaSession API，可以用来监听耳机按钮事件。与使用的设备也有关系，某些设备可能无法正常使用]"
            }
        ]
    },
    {
        "version": "v4.0.0",
        "order": 35,
        "time": "2024.01.03~2024.3.17",
        "content": [
            {
                itemTime: "[03.14D]",
                itemContent: "最近几个月跟新了好多东西，没保存重装系统东西都没了，哎"
            },
            {
                itemTime: "[2024/3/17 23:20]",
                itemContent: "虽然说呢最近几个月更新的东西没了，但至少这个还在吧，为了更好的维护发展，决定对项目再去确定一下页面、主题等的一些基本的信息，确定好思路再做项目，不然总是做着做着没思路，增加制作、维护成本"
            },
            {
                itemTime: "[2024/3/23 15:06]",
                itemContent: "历时两天半，Lrc歌词制作工具也是简单上线了哈。"
            },
            {
                itemTime: "[2024/3/25 01:31]",
                itemContent: "Lrc歌词制作工具简单优化了一下下。"
            },
            {
                itemTime: "[2024/3/25 23:57]",
                itemContent: "侧边第二块导航链接移除，移动到header头部"
            },
            {
                itemTime: "[2024/4/01 12:39]",
                itemContent: "歌词制作bug优化、4.0上线"
            },
            {
                itemTime: "[2024/4/13 12:34]",
                itemContent: "audio.js列表更新优化使用分时函数"
            },
            {
                itemTime: "[2024/4/13 xx:xx]",
                itemContent: "dialog性能优化"
            },
            {
                itemTime: "[2024/4/16 00:14]",
                itemContent: "yiYan.js内容更新"
            },
            {
                itemTime: "[2024/4/17 13:09]",
                itemContent: "index.html:footer界面优化"
            }
        ]
    },
    {
        "version": "v4.0.1",
        "order": 36,
        "time": "2024.04.19~2024.04.26",
        "content": [
            {
                itemTime: "[2024/4/19 19:34] and [2024/4/23 15:42]",
                itemContent: "css手机端优化"
            },
            {
                itemTime: "[2024/4/26 16:23]",
                itemContent: "soSuoItem.js 针对中文输入法导致高频事件触发优化"
            }
        ]
    },
    {
        "version": "v4.2.0",
        "order": 37,
        "time": "2024.05.1 And 14",
        "content": [
            {
                itemTime: "[2024/5/01 00:56]",
                itemContent: "audio.js setOffset的是否有歌词使用惰性函数，只在音乐改变后进行一次判断是否有歌词，而不需要每运行一次setOffset都去判断，有一定优化作用。"
            },
            {
                itemTime: "[2024/5/14 12:11]",
                itemContent: "更新了 Q爱记影院"
            }
        ]
    },
    {
        "version": "v4.2.5",
        "order": 38,
        "time": "2024.06.01",
        "content": [
            {
                itemTime: "[2024/5/22 14:07]",
                itemContent: "设置音乐播放时间，在下次打开页面后自动跳转到上次播放位置。"
            }
        ]
    },
    {
        "version": "v4.2.6",
        "order": 39,
        "time": "2024.06.08",
        "content": [
            {
                itemTime: "[2024/6/7]",
                itemContent: "音乐列表、图片等更新。"
            },
            {
                itemTime: "[2024/6/8 18:43]",
                itemContent: "Lrc歌词制作体验优化。"
            },
            {
                itemTime: "[2024/6/8 19:46]",
                itemContent: "更新了一些失效的音乐"
            }
        ]
    },
    {
        "version": "v4.2.7",
        "order": 40,
        "time": "2024.06.18",
        "content": [
            {
                itemTime: "[2024/06/16]",
                itemContent: "影院页面优化"
            },
            {
                itemTime: "[2024/06/18]",
                itemContent: "音乐更新。"
            },
            {
                itemTime: "",
                itemContent: "【备份】"
            }
        ]
    },
    {
        "version": "v4.2.8",
        "order": 41,
        "time": "2024.12.11",
        "content": [
            {
                itemTime: "[2024/12/11 14:56]",
                itemContent: "个人简历页面增加多种样式及切换功能"
            },
            {
                itemTime: "[2024/12/13 13:24]",
                itemContent: "音乐列表显示优化"
            }
        ]
    },
    {
        "version": "v4.2.9",
        "order": 42,
        "time": "2024.12.27",
        "content": [
            {
                itemTime: "[2024/12/27 10:35]",
                itemContent: "开发环境新增\"获取歌曲头像Lrc歌词.py\"文件快速获取头像和歌词，加快数据更新"
            },
            {
                itemTime: "[2024/12/27 10:35]",
                itemContent: "音乐时长查看体验优化"
            },
            {
                itemTime: "[2025/01/04 09:22]",
                itemContent: "音乐增加2首，时间显示bug优化"
            },
            {
                itemTime: "[2025/01/04 10:55]",
                itemContent: "音乐音乐加载错误体验优化"
            },
            {
                itemTime: "[2025/01/15 15:28]",
                itemContent: "加入MV功能，如果有MV则自动播放MV【MV开关后续再加，暂时手动可以暂停就行了】"
            },
            {
                itemTime: "[2025/01/17 01:54]",
                itemContent: "Lrc歌词制作（逐行打点）页面优化"
            },
            {
                itemTime: "[2025/02/02 23:51]",
                itemContent: "东西丢失了最近重新恢复一下"
            }
        ]
    },
    {
        "version": "v4.3.0",
        "order": 43,
        "time": "2025.02.15",
        "content": [
            {
                itemTime: "[2025/02/15 15:37]",
                itemContent: "MV更新，视频播放器界面更新，继续更改为主css文件与首页html文件分离，加快加载速度。并优化了代码可读性。新版似乎在性能消耗方面有所提高，不过不是很大"
            },
            {
                itemTime: "[2025/02/18 14:26]",
                itemContent: "视频播放bug更新"
            },
            {
                itemTime: "[2025/02/26 09:02]",
                itemContent: "增加了文案。音乐存在MV时因为加载时间导致会在这段时间内播放音乐bug修复。切换上一首时清除错误超时。audio.onended=>lastChange。我觉得东西保存在电脑本地是我最大的错误，这次是东西全没了。。"
            },
            {
                itemTime: "[2025/03/02 14:26]",
                itemContent: "视频播放bug更新"
            }
        ]
    },
    {
        "version": "v4.3.1",
        "order": 44,
        "time": "2025.03.02",
        "content": [
            {
                itemTime: "[2025/03/02 10:13]",
                itemContent: "audioMv.js进入页面自动播放关闭"
            },
            {
                itemTime: "[2025/03/02 10:39]",
                itemContent: "为兼容github类网站，统一使用相对位置引入文件-/*.css"
            },
            {
                itemTime: "[2025/03/02 11:24]",
                itemContent: "audioMv.js在HTML文件中引用JavaScript文件时，script标签的src属性路径是相对于包含该HTML文件的位置，而不是相对于JavaScript文件本身bug修复"
            }
        ]
    },
    {
        "version": "v4.3.2",
        "order": 45,
        "time": "2025.03.06",
        "content": [
            {
                itemTime: "[2025/03/06 10:40]",
                itemContent: "解决视频状态206，发现feach和video的状态码还不一样，搞不了，好像只有我电脑现在是这样，以前包括在其他电脑上都没问题，不管了。"
            },
            {
                itemTime: "[2025/03/06 13:47]",
                itemContent: "新增了一首音乐"
            },
            {
                itemTime: "[2025/03/06 14:13]",
                itemContent: "修复 main.js:1 Uncaught (in promise) NotAllowedError: play() failed because the user didn't interact with the document first。"
            },
            {
                itemTime: "[2025/03/06 21:27]",
                itemContent: "中午着急上课代码写错了，这会改一下"
            }
        ]
    },
    {
        "version": "v4.3.3",
        "order": 46,
        "time": "2025.03.08",
        "content": [
            {
                itemTime: "[2025/03/08 19:56]",
                itemContent: "video type update. audio plus six."
            },
            {
                itemTime: "[2025/03/08 20:06]",
                itemContent: "封面更新。"
            },
            {
                itemTime: "[2025/03/09 09:09]",
                itemContent: "播放bug修复"
            },
            {
                itemTime: "[2025/03/09 10:39]",
                itemContent: "新增音乐坟草钢木"
            },
            {
                itemTime: "[2025/03/11 15:42]",
                itemContent: "新增一首音乐"
            }
        ]
    },
    {
        "version": "v4.3.4",
        "order": 47,
        "time": "2025.03.22",
        "content": [
            {
                itemTime: "[2025/03/22 11:39]",
                itemContent: "简历证书扫描件更新"
            },
            {
                itemTime: "[2025/03/24 13:48]",
                itemContent: "视频显示优化"
            },
            {
                itemTime: "[2025/03/24 22:33]",
                itemContent: "MV增加"
            },
            {
                itemTime: "[2025/03/xx xx:33]",
                itemContent: "联系我、video、bug细节优化，手机端显示bug修复"
            },
            {
                itemTime: "[2025/04/20 20:12]",
                itemContent: "丝光椋鸟、花椒。更新、上传"
            }
        ]
    },
    {
        "version": "v4.3.5",
        "order": 48,
        "time": "2025.04.21",
        "content": [
            {
                itemTime: "[2025/04/21 10:02]",
                itemContent: "修复了错误：<br />1. 页面首次播放会提示需要用户点击一次才能自动播放 main.js:1 Uncaught (in promise) NotAllowedError: play() failed because the user didn't interact with the document first.<br /> 2. The play() request was interrupted by a call to pause()."
            }
        ]
    },
    {
        "version": "v4.3.6",
        "order": 49,
        "time": "2025.04.24",
        "content": [
            {
                itemTime: "[2025/04/24 13:47]",
                itemContent: "开发环境使用不缩进&lt;head&gt;和&lt;body&gt;部分，增加传输效率。并在\"head, body, /html\"标记之前将有额外新行增加可读性"
            }
        ]
    },
    {
        "version": "v4.3.7",
        "order": 50,
        "time": "2025.05.05",
        "content": [
            {
                itemTime: "[2025/05/05 08:20]",
                itemContent: "首页搜索框submit、reset优化&阻止按下上下键的默认事件"
            }
        ]
    },
    {
        "version": "v4.3.8",
        "order": 51,
        "time": "2025.05.10",
        "content": [
            {
                itemTime: "[2025/05/10 13:58]",
                itemContent: "优化了首页，替换 javascript: 链接为更安全的形式"
            },
            {
                itemTime: "[2025/05/10 13:58]",
                itemContent: "添加缺失的input id=input is label element,并设置隐藏样式"
            },
            {
                itemTime: "[2025/05/10 13:58]",
                itemContent: "脚本增加defer属性，避免阻塞页面"
            },
            {
                itemTime: "[2025/05/10 15:25]",
                itemContent: "优化了版本列表开发环境，便于版本数据化管理"
            },
            {
                itemTime: "[2025/05/10 22:01]",
                itemContent: "使用ffmpeg对损坏的视频文件进行了修复"
            },
            {
                itemTime: "[2025/05/10 23:15]",
                itemContent: "对部分音乐缺失的歌词、封面进行了更新"
            },
            {
                itemTime: "[2025/05/11 00:48]",
                itemContent: "优化了音乐部分。增加esc取消搜索快捷键"
            }
        ]
    },
    {
        version: "v4.3.9",
        order: 52,
        time: "2025.05.11",
        content: [
            {
                itemTime: "[2025/05/11 17:47]",
                itemContent: "手机等其他前端设备显示优化"
            },
            {
                itemTime: "[2025/05/11 22:33]",
                itemContent: "其他前端设备优化结束、并对界面进行了简单优化"
            },
            {
                itemTime: "[2025/05/27 13:40]",
                itemContent: "移除了script标签的defer属性，避免阻塞页面，因为在某些浏览器中，defer属性可能会导致脚本在页面加载完成后才执行，从而影响页面的交互性。但本站中并不适用该属性适用的场景"
            }
        ]
    },
    {
        version: "v4.3.9.1",
        order: 53,
        time: "2025.05.27",
        content: [
            {
                itemTime: "[2025/05/27 18:55]",
                itemContent: "优化了视频区域显示"
            }
        ]
    },
    {
        version: "v4.4.0",
        order: 54,
        time: "2025.05.28",
        content: [
            {
                itemTime: "[2025/05/31 07:25]",
                itemContent: "使用NProgress显示开屏启动页面加载进度的，移除了全屏蒙版的加载效果"
            },
            {
                itemTime: "[2025/05/31 08:17]",
                itemContent: "使用 (<[^>]*?)\\s*[\\n\\r]+\\s* to $1 替换 标签中的多余空格和换行符，避免在代码块中出现多余的空格和换行符"
            },
            {
                itemTime: "[2025/06/22 13:11]",
                itemContent: "更新了黑胶唱片蒙版显示问题"
            },
            {
                itemTime: "[2025/06/22 13:13]",
                itemContent: "进行了一次备份和多余代码移除"
            },
            {
                itemTime: "[2025/06/22 13:41]",
                itemContent: "音乐封面加载位置调整"
            },
            {
                itemTime: "[2025/07/17 00:45]",
                itemContent: "audioMV播放数据优化，不存在的poster数据修改"
            },
            {
                itemTime: "[2025/07/21 13:41]",
                itemContent: "优化了QFQ.html命名About.html，并对页面数据进行了分离，时间轴数据优化，改为js文件放松存储数据"
            }
        ]
    },
    {
        "version": "v5.0.0",
        "order": 55,
        "time": "2025.07.28",
        "content": [
            {
                itemTime: "[2025/07/28 10:28]",
                itemContent: "网站正式更名为壹比零，并决定更新网站logo将在此次升级中体现，决定将界面进行第二次重构，并修改为更符合编程规范的英文驼峰命名，也将是国际化的开端"
            },
            {
                itemTime: "[2025/07/28]",
                itemContent: "在最新的v5.0版本中使用了比VScode更高效的Cursor开发工具，并使用Cursor Ai帮助优化页面，大大提高了开发效率和网页可读性。"
            },
            {
                itemTime: "[2025/07/29 20:22]",
                itemContent: "首先，我们更新了当前网页的NProgress.set位置分布。"
            },
            {
                itemTime: "[2025/07/29 20:10:00]",
                itemContent: "全面重构代码命名规范，将所有不规范的拼音命名改为英文驼峰命名，提升代码可读性和国际化标准。"
            },
            {
                itemTime: "[2025/07/29 20:40:00]",
                itemContent: "重构文件结构：将css文件夹重命名为styles，js文件夹重命名为scripts，统一使用camelCase命名规范。"
            },
            {
                itemTime: "[2025/07/29 21:10:00]",
                itemContent: "更新所有HTML元素ID和class命名，从拼音改为有意义的英文名称，如：spsjhb→menuButton，soSuoItem→searchSuggest等。"
            },
            {
                itemTime: "[2025/07/29 22:00:00]",
                itemContent: "修复了多个JavaScript错误：解决'Cannot read properties of null (reading style)'错误，为所有DOM元素访问添加null检查。"
            },
            {
                itemTime: "[2025/07/29 22:40:00]",
                itemContent: "优化NProgress加载进度条，修复nprogress.js:376错误，确保进度条在所有资源加载完成后才初始化。"
            },
            {
                itemTime: "[2025/07/29 23:20:00]",
                itemContent: "修复音频文件路径问题，确保时钟相关音频文件正确加载，避免404错误。"
            },
            {
                itemTime: "[2025/07/30 00:10:00]",
                itemContent: "优化开发体验：解决Chrome浏览器干预提示和Live reload提示，提升开发环境稳定性。"
            },
            {
                itemTime: "[2025/07/30 00:51:43]",
                itemContent: "完成时间记录更新，将所有修改内容按实际工作进度重新排序并精确到秒显示。"
            },
            {
                itemTime: "[2025/07/30 01:23:55]",
                itemContent: "代码优化与修复：优化time.js文件，添加UTC+8时区支持，消除代码重复，使用现代JavaScript语法，代码行数减少48%（91行→47行）。"
            },
            {
                itemTime: "[2025/07/30 01:25:00]",
                itemContent: "进一步优化time.js：添加完整错误处理，缓存DOM查询，使用箭头函数和模板字符串，提高代码健壮性和可读性。"
            },
            {
                itemTime: "[2025/07/30 01:30:00]",
                itemContent: "优化qingmingFestival.js文件：添加UTC+8时区支持，修复清明节日期计算逻辑，简化代码结构，使用箭头函数和三元运算符，代码行数减少13%（37行→32行）。"
            },
            {
                itemTime: "[2025/07/30 01:35:00]",
                itemContent: "文件重命名：将updateList.js重命名为changelog.js，更符合国际命名规范，并更新相关引用。"
            },
            {
                itemTime: "[2025/07/30 09:00:00]",
                itemContent: "从今天早上开始进行了。SEO优化：更新网站标题、描述、关键词，添加结构化数据(JSON-LD)，包含壹比零、一比零、oneLove、1:0等关键词，提升搜索引擎可见性。"
            },
            {
                itemTime: "[2025/07/30 09:15:00]",
                itemContent: "网站重命名：将所有页面中的'Q爱记'和'Q愛记'统一重命名为'壹比零'，包括标题、meta标签、内容文本等。"
            },
            {
                itemTime: "[2025/07/30 09:30:00]",
                itemContent: "NProgress优化：修复进度条执行两次的问题，将NProgress.start()移到脚本解析时立即执行，确保加载体验更流畅。"
            },
            {
                itemTime: "[2025/07/30 09:45:00]",
                itemContent: "JavaScript错误修复：解决UTC8_OFFSET重复声明问题，将qingmingFestival.js中的常量重命名为QINGMING_UTC8_OFFSET，避免与time.js冲突。"
            },
            {
                itemTime: "[2025/07/30 10:00:00]",
                itemContent: "临时功能添加：实现45分钟休息提醒功能，包含远眺建议、屏幕亮度建议、确认对话框、倒计时显示、音频提示等完整功能。"
            },
            {
                itemTime: "[2025/07/30 10:15:00]",
                itemContent: "休息提醒优化：添加30秒钟表报时音效、老式时钟八点报时音效、音乐播放控制、测试按钮、本地开发环境限制等功能。"
            },
            {
                itemTime: "[2025/07/30 10:30:00]",
                itemContent: "Pages目录重命名：将中文文件和文件夹重命名为英文驼峰命名，包括contactMe.html、videoParser.html、party、cinema、skinColorTest、lrcLyricMaker等17个项目。"
            },
            {
                itemTime: "[2025/07/30 10:45:00]",
                itemContent: "Tools目录重命名：将'音乐播放器'重命名为'musicPlayer'，保持confession和loveMeDailySign不变（已是英文）。"
            },
            {
                itemTime: "[2025/07/30 11:00:00]",
                itemContent: "party目录重命名：将'快问速答'、'真心话大冒险'、'答案之书'分别重命名为'quickQuestionAnswer'、'truthOrDare'、'answerBook'，相关数据文件也同步重命名。"
            },
            {
                itemTime: "[2025/07/30 11:15:00]",
                itemContent: "QFQ目录重命名：将'个人简历.html'重命名为'personalResume.html'，个人简历图片文件夹也同步重命名。"
            },
            {
                itemTime: "[2025/07/30 11:30:00]",
                itemContent: "lrcLyricMaker目录重命名：将'Lrc歌词制作.html'重命名为'lrcLyricMaker.html'，保持功能完整性。"
            },
            {
                itemTime: "[2025/07/30 11:45:00]",
                itemContent: "文档更新：创建ReadMe.json文件，详细记录重命名过程和结果，包含完整的目录结构、命名规范说明和完成统计。"
            },
            {
                itemTime: "[2025/07/30 12:00:00]",
                itemContent: "代码优化：window.on.js文件添加visibilitychange事件监听，优化移动端音乐播放时间保存逻辑，提高用户体验。"
            },
            {
                itemTime: "[2025/07/30 12:15:00]",
                itemContent: "readme.md更新：添加详细的页面结构分析，优化'观念'和'介绍'部分内容，提升项目文档质量。"
            },
            {
                itemTime: "[2025/07/30 12:30:00]",
                itemContent: "sitemap.xml创建：为网站添加XML站点地图，帮助搜索引擎更好地索引网站内容。"
            },
            {
                itemTime: "[2025/07/30 12:45:00]",
                itemContent: "manifest.json更新：将PWA应用名称从'Q爱记'更新为'壹比零'，保持品牌一致性。"
            },
            {
                itemTime: "[2025/07/30 13:00:00]",
                itemContent: "多页面同步更新：About.html、Tools相关页面、影院、视频解析、肤色测试、联系我等页面的标题和内容都更新为'壹比零'。"
            },
            {
                itemTime: "[2025/07/30 13:15:00]",
                itemContent: "package.json更新：将项目名称从'Q爱记-官网'更新为'壹比零-官网'，保持npm包管理的一致性。"
            },
            {
                itemTime: "[2025/07/30 13:30:00]",
                itemContent: "项目规范化：完成17个文件/文件夹的重命名，遵循camelCase命名规范，提高代码可读性和跨平台兼容性。"
            },
            {
                itemTime: "[2025/07/30 21:47:23]",
                itemContent: "休息提醒功能优化：修复页面隐藏时计时器停止的问题，确保计时器在页面隐藏时继续运行，提升用户体验。"
            },
            {
                itemTime: "[2025/07/30 21:48:00]",
                itemContent: "测试环境优化：将测试环境的提醒间隔从45分钟调整为1分钟，便于快速测试和调试休息提醒功能。"
            },
            {
                itemTime: "[2025/07/30 21:49:00]",
                itemContent: "累计工作时长功能：新增智能累计工作时长系统，使用localStorage持久化存储，页面刷新后保持累计时长状态。"
            },
            {
                itemTime: "[2025/07/30 21:50:00]",
                itemContent: "立即休息功能：实现页面加载时检查累计时长，如果超过阈值（测试环境30秒，生产环境45分钟）立即进入休息状态。"
            },
            {
                itemTime: "[2025/07/30 21:51:00]",
                itemContent: "累计时长管理：添加开始/停止累计、重置累计、保存/加载累计时长等完整功能，支持页面可见性变化时的智能累计控制。"
            },
            {
                itemTime: "[2025/07/30 21:52:00]",
                itemContent: "测试功能增强：为测试按钮添加中键重置累计时长功能，左键测试休息提醒，右键测试老式时钟音效，提升开发调试体验。"
            },
            {
                itemTime: "[2025/07/30 21:53:00]",
                itemContent: "工作流程优化：休息结束后自动重置累计时长并重新开始工作，取消休息时继续累计工作时长，形成完整的工作-休息循环。"
            },
            {
                itemTime: "[2025/07/30 21:54:00]",
                itemContent: "界面调整：测试按钮位置从top: 20px调整为top: 60px，避免与其他界面元素重叠。"
            }
        ]
    },
    {
        "version": "v5.0.1",
        "order": 56,
        "time": "2025.07.31",
        "content": [
            {
                itemTime: "[2025/07/31 21:16]",
                itemContent: "5.0.0版本扩展延伸，开始使用完全免费方案：Oracle Cloud + Freenom + MongoDB Atlas，将功能扩展到前后端都有。"
            },
            {
                itemTime: "[2025/08/01 00:03:02]",
                itemContent: "项目架构重构：开始全栈开发学习，设计完整的后端API系统。"
            },
            {
                itemTime: "[2025/08/01 00:05:15]",
                itemContent: "创建Express服务器基础架构，实现Node.js后端开发环境搭建。"
            },
            {
                itemTime: "[2025/08/01 00:08:30]",
                itemContent: "设计MongoDB数据库模型：用户表(users)、用户数据表(user_data)、更新日志表(changelog)。"
            },
            {
                itemTime: "[2025/08/01 00:12:45]",
                itemContent: "实现JWT用户认证系统，包含注册、登录、密码修改等完整API接口。"
            },
            {
                itemTime: "[2025/08/01 00:16:20]",
                itemContent: "创建认证中间件，实现令牌验证、用户权限控制、可选认证支持。"
            },
            {
                itemTime: "[2025/08/01 00:19:35]",
                itemContent: "设计数据库配置文件，实现MongoDB连接、错误处理、优雅关闭机制。"
            },
            {
                itemTime: "[2025/08/01 00:22:50]",
                itemContent: "实现用户数据模型(User.js)，包含密码加密存储、数据验证、虚拟字段等功能。"
            },
            {
                itemTime: "[2025/08/01 00:25:15]",
                itemContent: "创建用户数据存储模型(UserData.js)，支持灵活的数据类型存储和访问权限控制。"
            },
            {
                itemTime: "[2025/08/01 00:28:40]",
                itemContent: "制定完整学习计划，设计前后端分离架构，确定技术栈：Node.js + Express + MongoDB + JWT。"
            },
            {
                itemTime: "[2025/08/01 00:31:25]",
                itemContent: "项目目标：将本地数据迁移到云端，实现多设备同步，建立用户登录系统，创建云端Changelog管理。"
            },
            {
                itemTime: "[2025/08/01 00:34:10]",
                itemContent: "学习内容：掌握前后端分离开发模式、RESTful API设计原则、MongoDB数据库操作、JWT用户认证机制。"
            },
            {
                itemTime: "[2025/08/01 00:36:55]",
                itemContent: "下一步计划：安装MongoDB Atlas云数据库，完成后端API开发，创建前端登录界面，实现数据迁移脚本。"
            },
            {
                itemTime: "[2025/08/01 22:58:58]",
                itemContent: "服务器成功启动，实现数据库连接错误处理机制，支持模拟模式运行。"
            },
            {
                itemTime: "[2025/08/01 23:05:30]",
                itemContent: "配置MongoDB Atlas IP白名单，设置数据库访问权限，准备测试真实数据库连接。"
            },
            {
                itemTime: "[2025/08/01 23:35:15]",
                itemContent: "数据库连接测试成功！MongoDB Atlas配置完成，所有数据库操作测试通过。"
            },
            {
                itemTime: "[2025/08/01 23:40:20]",
                itemContent: "修复认证路由问题，集成真实的用户注册/登录API，实现JWT令牌认证和密码加密。"
            },
            {
                itemTime: "[2025/08/02 00:08:36]",
                itemContent: "创建前端登录和注册页面，修复静态文件服务配置，实现完整的用户认证界面。"
            },
            {
                itemTime: "[2025/08/02 00:10:15]",
                itemContent: "静态文件服务配置完成，Pages文件夹可正常访问，登录注册页面功能测试通过。"
            },
            {
                itemTime: "[2025/08/02 00:34:30]",
                itemContent: "注册功能调试：创建debug-register.html和test-console.html页面，用于诊断注册API和JavaScript错误。"
            },
            {
                itemTime: "[2025/08/02 00:35:15]",
                itemContent: "服务器状态确认：MongoDB连接正常，Express服务器运行在端口3000，静态文件服务配置正确。"
            },
            {
                itemTime: "[2025/08/02 00:40:25]",
                itemContent: "修复CSP错误：调整Helmet安全策略配置，允许内联脚本执行，解决内容安全策略阻止JavaScript的问题。"
            },
            {
                itemTime: "[2025/08/02 00:45:30]",
                itemContent: "完善用户认证系统：创建完整的登录页面，实现用户登录、令牌存储、自动跳转功能。"
            },
            {
                itemTime: "[2025/08/02 00:54:15]",
                itemContent: "创建用户仪表板：开发dashboard.html页面，显示用户信息、数据统计、快速操作功能。"
            },
            {
                itemTime: "[2025/08/02 00:5t:20]",
                itemContent: "完善主页用户认证：在index.html添加用户认证区域，集成登录/注册链接和用户信息显示。"
            },
            {
                itemTime: "[2025/08/02 00:56:30]",
                itemContent: "用户认证系统完成：实现完整的注册→登录→仪表板→主页显示的用户流程，支持令牌验证和自动跳转。"
            },
            {
                itemTime: "[2025/08/02 01:05:15]",
                itemContent: "修复主页访问问题：修改服务器根路由配置，现在访问http://localhost:3000会显示主页HTML而不是API信息。"
            },
            {
                itemTime: "[2025/08/02 01:10:25]",
                itemContent: "修复页面跳转路径：修正登录和注册页面的跳转路径，确保正确跳转到主页根路径而不是index.html。"
            },
            {
                itemTime: "[2025/08/02 01:15:30]",
                itemContent: "修复退出登录功能：添加页面强制刷新，确保退出登录后立即更新界面状态。"
            },
            {
                itemTime: "[2025/08/02 01:16:15]",
                itemContent: "完善静态文件服务：添加scripts、time、biJi等目录的静态文件服务配置，解决音乐文件和其他资源访问问题。"
            },
            {
                itemTime: "[2025/08/02 01:20:45]",
                itemContent: "修复CSP内联事件错误：移除所有onclick内联事件处理器，改用JavaScript事件监听器，解决内容安全策略阻止内联脚本的问题。"
            },
            {
                itemTime: "[2025/08/02 01:25:30]",
                itemContent: "修复CSP外部资源错误：更新内容安全策略配置，允许加载unpkg、g.alicdn、cdn.jsdelivr.net等外部CDN资源，解决外部脚本和样式加载问题。"
            },
            {
                itemTime: "[2025/08/02 01:30:15]",
                itemContent: "临时禁用CSP策略：在开发环境中暂时禁用内容安全策略，解决外部CDN资源加载问题，确保所有功能正常工作。"
            },
            {
                itemTime: "[2025/08/02 01:35:20]",
                itemContent: "完全移除Helmet中间件：彻底解决CSP问题，确保所有外部资源正常加载，包括NProgress、iframe和Service Worker。"
            },
            {
                itemTime: "[2025/08/02 01:40:10]",
                itemContent: "添加HTML级CSP配置：在index.html中添加meta标签覆盖服务器CSP头，确保所有外部资源正常加载。"
            },
            {
                itemTime: "[2025/08/02 08:03:25]",
                itemContent: "修复iframe CSP错误：更新CSP配置添加frame-src指令，允许加载localhost:3000的iframe内容。"
            },
            {
                itemTime: "[2025/08/02 08:05:30]",
                itemContent: "彻底移除所有CSP配置：完全禁用Helmet中间件和HTML级CSP meta标签，确保开发环境中没有任何CSP限制。"
            },
            {
                itemTime: "[2025/08/03 14:04:36]",
                itemContent: "优化changelog时间管理：实现通过终端命令获取精确时间功能，确保每次更新都能记录到秒级精度的时间戳，提升开发记录准确性。"
            },
            {
                itemTime: "[2025/08/04 07:54:38]",
                itemContent: "修复了开发工具Cursor。修复用户界面问题：1) 修复头像显示问题，保留QQ头像获取功能；2) 修复休息时间按钮显示逻辑，确保始终可见；3) 优化个人中心与sideMenu的集成，支持手机端和电脑端；4) 优化hover效果UI，修复文字溢出问题。"
            },
            {
                itemTime: "[2025/08/04 23:15:00]",
                itemContent: "重新设计休息时间减少功能：1) 在休息提醒界面中直接添加减少时间按钮，解决hover后才能点击的问题；2) 添加Toast提示功能，提供更好的用户反馈；3) 简化测试按钮功能，只用于开始休息；4) 优化用户体验，减少时间操作更直观。"
            },
            {
                itemTime: "[2025/08/05 06:58:02]",
                itemContent: "修复LRC文件加载问题：1) 修复Node.js后端服务时LRC文件无法加载的问题，在scripts/audio.js的getLrc函数中添加urlIng变量检查和URL路径优化；2) 具体修复：添加if (typeof urlIng === 'undefined' || !urlIng) { urlIng = window.location.origin; }确保urlIng变量正确设置；3) 添加const baseUrl = urlIng.endsWith('/') ? urlIng.slice(0, -1) : urlIng;避免双斜杠导致的404错误；4) 修改$.get调用为$.get(`${baseUrl}/music/lrc/${titC}.lrc`, ...)确保LRC文件在Python和Node.js环境下都能正常加载。"
            },
            {
                itemTime: "[2025/08/05 07:04:11]",
                itemContent: "头像功能优化：1) 合并右上角头像与下拉菜单头像，统一QQ头像获取功能；2) 修改右上角头像样式为圆形，与下拉菜单头像保持一致；3) 优化头像显示逻辑，确保两个头像同步更新。"
            },
            {
                itemTime: "[2025/08/05 07:04:11]",
                itemContent: "响应式个人中心重构：1) 移除个人中心按钮，将功能完全集成到SideMenu；2) 实现基于屏幕尺寸的动态显示：手机端(≤600px)显示SideMenu个人中心，PC端(>600px)显示下拉菜单；3) 未登录时显示基本设置，登录后显示用户信息和数据统计；4) 添加窗口大小变化监听器，实时调整显示方式；5) 优化用户体验，手机端可直接通过SideMenu访问个人中心。"
            },
            {
                itemTime: "[2025/08/05 07:12:44]",
                itemContent: "UI样式修复：1) 恢复右上角头像的原始方形样式，保持原有的设计风格；2) 修复dropdownUsername在未登录状态下的显示问题，确保正确显示'用户'文本；3) 确保测试休息提醒按钮在所有状态下都能正常显示；4) 优化头像同步逻辑，保持右上角头像与下拉菜单头像的一致性。"
            },
            {
                itemTime: "[2025/08/05 07:24:17]",
                itemContent: "个人中心入口优化：1) PC端(>600px)个人中心按钮始终显示，提供稳定的用户入口；2) 手机端(≤600px)SideMenu即个人中心入口，不管登录状态都有入口；3) 未登录时显示登录选项，登录后显示个人信息和数据统计；4) 优化SideMenu样式，添加渐变背景、阴影效果和hover动画；5) 修复下拉菜单文本显示问题，增加最小高度和宽度优化。"
            },
            {
                itemTime: "[2025/08/05 07:34:22]",
                itemContent: "SideMenu全屏覆盖优化：1) 修复SideMenu显示逻辑，确保进入个人中心时完全覆盖整个页面（包括main和footer）；2) 优化动画效果，使用translateX(-100vw)和translateX(100vw)实现平滑的左右滑动；3) 设置z-index为9999确保SideMenu在最顶层；4) 使用100vh高度和100vw宽度实现真正的全屏覆盖；5) 添加backdrop-filter模糊效果和box-shadow阴影增强视觉效果。"
            },
            {
                itemTime: "[2025/08/05 22:00:33]",
                itemContent: "修复歌词加载问题：1) 修复scripts/audioList.js中urlIng变量设置逻辑，调整条件判断顺序；2) 将localhost检测条件提前，确保127.0.0.1:3000等本地地址能正确设置urlIng为window.location.origin；3) 修改http检测条件，使用window.location.origin而不是window.location.href避免路径问题；4) 确保Node.js后端服务时LRC文件能正常加载，解决歌词显示为空的问题。"
            },
            {
                itemTime: "[2025/08/05 22:06:12]",
                itemContent: "修复个人中心入口问题：1) 将showPersonalCenter函数定义为全局函数(window.showPersonalCenter)，解决'Uncaught ReferenceError: showPersonalCenter is not defined'错误；2) 确保电脑端点击下拉菜单中的'个人中心'按钮能正常调用headers()函数；3) 手机端点击menuButton按钮直接调用headers()函数进入个人中心；4) 统一PC端和手机端的个人中心入口逻辑，都通过headers()函数显示SideMenu。"
            },
            {
                itemTime: "[2025/08/05 22:16:08]",
                itemContent: "个人中心页面合并完成：1) 将Pages/dashboard.html的完整内容合并到index.html的#sideMenu中；2) 添加用户头像、邮箱、角色等详细信息显示；3) 集成数据统计功能（总数据、密码、电话、笔记）；4) 添加快速操作按钮（添加密码、添加电话、添加笔记）；5) 更新CSS样式，添加.user-avatar、.user-name、.user-email、.user-role等样式；6) 删除原来的Pages/dashboard.html文件，统一使用SideMenu作为个人中心入口；7) 确保登录前后都能正确显示个人中心内容。"
            },
            {
                itemTime: "[2025/08/05 22:18:43]",
                itemContent: "修复个人中心按钮hover效果：优化.dropdown-item:hover样式，减少transform位移和调整边距，避免hover时超出容器边界，提升用户体验。"
            },
            {
                itemTime: "[2025/08/05 22:20:50]",
                itemContent: "修复API端点错误：将loadUserStats函数中的API端点从/api/data/stats修正为/api/userdata/stats，解决404错误问题。"
            },
            {
                itemTime: "[2025/08/05 22:33:26]",
                itemContent: "修复个人中心显示逻辑：登录后PC端也显示统计信息，未登录时隐藏整个sideMenuDashboard父元素，确保登录状态正确反映在界面上。"
            },
            {
                itemTime: "[2025/08/05 23:17:57]",
                itemContent: "修复工具合集404错误并优化工具数据管理：创建Pages/Tools/index.html文件提供工具合集首页，展示所有可用工具包括屏幕补光灯、富文本编辑器、音乐播放器、表白墙、每日签到等，添加美观的卡片式布局和响应式设计，修复SideMenu中头像同步问题确保user-avatar与dropdownAvatar保持一致，修复showRestReminder函数作用域问题将函数暴露到全局作用域解决'Uncaught ReferenceError: showRestReminder is not defined'错误，优化Tools list.json结构支持自动化更新工具数据包括开发状态、使用统计、版本信息等。"
            },
            {
                itemTime: "[2025/08/05 23:17:57]",
                itemContent: "修复工具合集404错误并优化工具数据管理：创建Pages/Tools/index.html文件提供工具合集首页，展示所有可用工具包括屏幕补光灯、富文本编辑器、音乐播放器、表白墙、每日签到等，添加美观的卡片式布局和响应式设计，修复SideMenu中头像同步问题确保user-avatar与dropdownAvatar保持一致，修复showRestReminder函数作用域问题将函数暴露到全局作用域解决'Uncaught ReferenceError: showRestReminder is not defined'错误，优化Tools list.json结构支持自动化更新工具数据包括开发状态、使用统计、版本信息等。"
            },
            {
                itemTime: "[2025/08/06 07:22:07]",
                itemContent: "修复API路由访问问题：确认/api/auth路由已正确配置，重新启动服务器确保路由生效，解决访问http://localhost:3000/api/auth时返回404错误的问题，现在可以正常访问认证API根路径获取API信息。"
            },
            {
                itemTime: "[2025/08/06 07:31:48]",
                itemContent: "修复PC端SideMenu退出后main-body显示问题：将退出SideMenu时main-body的display从'block'修正为'flex'，确保PC端进入SideMenu后退出时页面布局正确恢复，保持原有的flex布局样式。"
            },
            {
                itemTime: "[2025/08/06 07:40:56]",
                itemContent: "修复手机端菜单按钮和profileDropdown显示问题：1) 修复手机端菜单按钮span元素缺失问题，确保进入SideMenu时显示3个span元素（第3个隐藏），退出时恢复为3个可见span；2) 添加CSS媒体查询@media (max-width: 600px)隐藏手机端profileDropdown，避免与SideMenu功能重复，手机端用户通过SideMenu访问个人中心功能。"
            },
            {
                itemTime: "[2025/08/06 07:45:01]",
                itemContent: "修复menuButton样式缺失问题：添加完整的menuButton CSS样式定义，包括容器样式（flex布局、尺寸、边距等）和span元素样式（高度、背景色、圆角、过渡动画等），解决menuButton下span元素大小为0的问题，确保手机端菜单按钮正常显示。"
            },
            {
                itemTime: "[2025/08/06 21:20:46]",
                itemContent: "重构dropdown元素样式结构：以personalCenterBtn为标准重新整理所有dropdown-item样式，合并重复的CSS属性，移除冗余的border-radius、word-wrap、overflow-wrap、white-space、min-height等重复声明，简化test-button-container样式，统一所有元素的hover效果为scale(1.02)，优化代码结构提升维护性。"
            },
            {
                itemTime: "[2025/08/06 21:25:00]",
                itemContent: "优化personalCenterBtn结构统一性：将personalCenterBtn从直接使用a标签改为div容器包裹a标签的结构，与authDropdownButtons和userDropdownInfo的div结构保持一致，提升dropdown-content内部元素的结构统一性，确保所有元素都有相同的容器层级和样式继承关系。"
            },
            {
                itemTime: "[2025/08/06 21:39:16]",
                itemContent: "完善dropdown结构统一性调整：将test-button-container也改为div容器包裹dropdown-item的结构，与personalCenterBtn、authDropdownButtons、userDropdownInfo保持一致，为所有容器添加统一的CSS样式（box-sizing、padding、margin），确保所有dropdown元素都有相同的结构层级和样式继承关系，提升代码的一致性和维护性。"
            },
            {
                itemTime: "[2025/08/06 22:00:21]",
                itemContent: "代码冗余优化清理：清理scripts/audio.js和scripts/audioList.js中的冗余console.log语句，保留必要的错误提示和浏览器兼容性警告。"
            },
            {
                itemTime: "[2025/08/06 22:24:40]",
                itemContent: "API认证问题分析：检查/api/auth/me返回401错误的原因，确认前端正确传递Authorization头，分析发现这是正常的未登录状态检查，用户未登录时API返回401是预期行为，验证了JWT认证机制正常工作，确保用户需要先登录才能访问受保护的API端点。"
            },
            {
                itemTime: "[2025/08/6~9]",
                itemContent: "最近每天早上起床和晚上睡觉前都会进行很多优化，但因为一些原因，导致没有记录具体信息。"
            },
            {
                itemTime: "[2025/08/10 00:13:13]",
                itemContent: "数据迁移，并解决数据库连接问题解决：修复MongoDB Atlas用户权限问题，更新数据库连接字符串，成功建立云端数据库连接，实现数据迁移功能，完成密码数据17条、手机数据6条的云端存储，系统数据统计显示总数据84条，验证了完整的用户认证和数据管理功能。"
            },
            {
                itemTime: "[2025/08/10 01:20:50]",
                itemContent: "管理页面认证系统完善：修复sessionStorage令牌获取问题，解决用户信息显示undefined错误，优化认证检查逻辑，移除多余调试代码，完成dashboard、passwords、phones三个管理页面的认证流程，实现用户友好的错误提示和登录引导，删除临时测试文件，系统认证机制完全正常。"
            },
            {
                itemTime: "[2025/08/10 01:30:11]",
                itemContent: "密码管理功能完善：实现完整的密码CRUD操作，添加模态框界面支持添加和编辑密码，集成密码生成器功能，实现密码显示/隐藏切换，添加后端API端点支持POST/PUT/DELETE操作，完善表单验证和错误处理，密码管理功能完全可用。"
            },
            {
                itemTime: "[2025/08/10 01:38:50]",
                itemContent: "手机数据展示修复：解决手机管理页面显示[object Object]问题，优化数据结构处理逻辑，支持嵌套对象格式的绑定APP信息，完善手机卡片显示功能，确保所有手机信息正确展示。"
            },
            {
                itemTime: "[2025/08/10 10:30:47]",
                itemContent: "管理员系统完善与Service Worker优化：成功修复requireAdmin中间件未定义错误，解决Mongoose模型重复定义问题，更新用户角色为admin，修复Service Worker CSP错误，创建本地化Service Worker实现离线缓存功能，移除调试日志，管理员面板功能完全正常。"
            },
            {
                itemTime: "[2025/08/10 10:36:19]",
                itemContent: "主页管理功能集成：在主页侧边菜单和主要内容区域添加管理页面入口，包括数据管理和管理员面板链接，为管理员用户提供便捷访问路径，添加美观的管理区块样式，实现响应式设计，完善用户角色显示逻辑。"
            },
            {
                itemTime: "[2025/08/10 11:12:23]",
                itemContent: "数据库结构优化与文档更新：清理数据库中的多余集合(userdatas)，保留核心集合(users、passwords、phones)，更新OneLove项目开发指南.md，添加详细的数据库结构说明、集合用途、数据迁移状态和连接信息，完善项目文档体系。"
            },
            {
                itemTime: "[2025/08/10 11:39:39]",
                itemContent: "数据管理功能完善：实现完整的数据导入导出系统，支持JSON和CSV格式导出，添加数据导入功能支持追加和覆盖模式，创建数据管理页面包含数据统计、导入导出、备份历史、批量操作等功能模块，集成到管理面板中，提供用户友好的数据管理界面。"
            },
            {
                itemTime: "[2025/08/10 11:57:38]",
                itemContent: "批量操作功能实现：添加批量删除密码数据API，实现批量导出指定数据类型功能，支持清空用户所有数据操作，在密码管理页面集成复选框选择、全选功能和批量删除按钮，完善数据管理页面的批量导出和清空数据功能，提供完整的数据批量操作体验。"
            },
            {
                itemTime: "[2025/08/10 12:11:27]",
                itemContent: "数据备份恢复系统实现：创建完整的数据备份API系统，支持手动创建备份、备份详情查看、数据恢复和备份删除功能，在数据管理页面集成备份创建、自动备份、恢复、下载和删除操作，提供备份统计信息和详细描述，实现数据安全和灾难恢复功能。"
            },
            {
                itemTime: "[2025/08/10 12:23:41]",
                itemContent: "数据安全增强系统实现：创建数据加密工具支持AES-256-CBC加密，实现密码数据自动加密存储和解密读取，添加访问日志模型记录用户操作和安全事件，集成安全审计中间件检测可疑活动，创建安全审计页面提供访问日志查看、统计分析和安全监控功能，实现完整的数据安全保护体系。"
            },
            {
                itemTime: "[2025/08/10 12:35:15]",
                itemContent: "管理页面功能完善：修复登录认证问题，添加数据库连接状态检查，实现模拟模式登录支持，创建用户管理页面包含用户列表、状态管理、角色管理等功能，创建系统设置页面包含系统配置、安全设置、备份设置、维护工具等功能模块，完善管理面板导航和权限控制，提供完整的管理员功能体验。"
            },
            {
                itemTime: "[2025/08/10 13:15:30]",
                itemContent: "权限控制系统优化：修复用户权限控制逻辑，区分普通用户仪表板和管理员仪表板功能，普通用户只能访问密码管理和手机管理功能，管理员可以访问用户管理、数据管理、安全审计、系统设置等高级功能，为数据管理和安全审计页面添加管理员权限检查，确保系统安全性。"
            },
            {
                itemTime: "[2025/08/10 13:25:45]",
                itemContent: "仪表板页面合并优化：将普通用户仪表板和管理员仪表板合并为统一的管理中心页面，根据用户角色动态显示不同功能模块，管理员可以看到所有功能（用户管理、数据管理、安全审计、系统设置），普通用户只能看到基本功能（密码管理、手机管理），简化了页面结构，提升了用户体验。"
            },
            {
                itemTime: "[2025/08/10 13:35:20]",
                itemContent: "系统清理优化：清理所有对已删除页面的引用，修复AccessLog模型枚举值缺失问题，删除重复的管理员面板模块，移除所有测试文件和临时文件（quick-test.js、verify-features.js、test-api.js、create-admin.js等），优化系统结构，确保代码整洁和功能完整性。"
            },
            {
                itemTime: "[2025/08/10 13:40:15]",
                itemContent: '首页按钮优化：删除index.html中重复的管理按钮，合并为统一的"管理中心"按钮，更新对应的JavaScript引用，简化用户界面，避免功能重复和用户困惑。'
            },
            {
                itemTime: "[2025/08/10 14:15:30]",
                itemContent: "URL锚点问题修复：修复退出登录和个人中心按钮的href属性，将href='#'改为href='javascript:;'，避免点击后URL变成http://localhost:3000/#的问题，同时移除logout函数中的window.location.reload()调用，改为调用checkUserAuth()函数，提升用户体验。"
            },
            {
                itemTime: "[2025/08/10 14:25:45]",
                itemContent: "操作按钮提示优化：为用户管理页面的操作按钮添加title属性，提供清晰的鼠标悬停提示信息，包括编辑用户信息、启用/禁用用户、提升/降级管理员权限等功能说明，同时为数据管理页面的所有操作按钮添加详细的功能提示，提升用户界面的友好性和易用性。"
            },
            {
                itemTime: "[2025/08/10 14:35:20]",
                itemContent: "登录问题诊断与修复：诊断并解决了重启电脑后登录失败的问题，发现MongoDB Atlas数据库连接正常，但用户密码可能被重置。成功重置管理员账户密码，确保系统管理员功能正常使用。"
            },
            {
                itemTime: "[2025/08/10 14:45:30]",
                itemContent: "CORS问题修复与功能完善：修复了前端页面访问127.0.0.1时API请求localhost导致的CORS错误，统一所有管理页面的API基础URL为动态获取。实现了完整的忘记密码功能，包括密码重置邮件发送、重置令牌验证和密码重置页面。创建了用户个人信息管理页面，支持查看和编辑个人资料、修改密码、查看数据统计等功能，完善了用户账户管理体系。"
            },
            {
                itemTime: "[2025/08/10 15:00:00]",
                itemContent: "移动端头像点击优化：针对手机端和PC端的不同使用场景，优化了头像点击行为。手机端点击头像时，如果用户未登录则跳转到登录页面，已登录则显示侧边菜单；PC端保持原有的QQ头像设置功能。侧边菜单中的头像在手机端点击时，未登录跳转登录页面，已登录跳转个人信息页面，提升了移动端用户体验。"
            },
            {
                itemTime: "[2025/08/11 01:49:58]",
                itemContent: "密码管理页面重构：将密码管理页面从卡片网格布局重构为类似通讯录的列表布局，简化了卡片显示内容，只显示基本信息（标题、用户名、分类）。详细信息通过点击展开显示，支持直接内联编辑，无需弹窗。添加新密码时直接在页面顶部显示表单，点击添加按钮即可提交，提升了操作效率和用户体验。"
            },
            {
                itemTime: "[2025/08/11 01:58:22]",
                itemContent: "密码显示优化：修改密码管理页面的显示逻辑，密码字段不再隐藏，直接显示明文内容。优化了数据结构的显示方式，支持动态字段显示和编辑，确保所有密码数据都能正确展示。简化了编辑表单，支持任意字段的添加和修改，提升了数据管理的灵活性。"
            },
            {
                itemTime: "[2025/08/11 02:02:11]",
                itemContent: "嵌套账户数据结构优化：重新设计密码管理页面的数据结构处理逻辑，支持分类为应用、应用下多个账户、每个账户有具体属性的三层结构。修复了[object Object]显示问题，正确展示每个账户的详细信息。优化了编辑表单，支持多账户的独立编辑和保存，提升了复杂数据结构的处理能力。"
            },
            {
                itemTime: "[2025/08/11 02:08:11]",
                itemContent: "多账户显示优化：修复了密码管理页面中多账户显示不完整的问题，增加了展开区域的最大高度，优化了账户数据的渲染样式。改进了账户信息的布局，确保所有账户都能正确显示，添加了调试信息以便追踪数据加载情况。"
            },
            {
                itemTime: "[2025/08/11 02:28:52]",
                itemContent: "属性模板系统完善：重构了密码管理页面的属性系统，提供丰富的预定义属性模板（用户名、密码、邮箱、手机号、状态、权重、角色、头像描述、登录方式、备注等）。修复了编辑界面中密码隐藏按钮的问题，优化了应用名称字段的布局，支持选择类型属性，提升了数据管理的灵活性和用户体验。"
            },
            {
                itemTime: "[2025/08/11 03:02:31]",
                itemContent: "智能属性推荐系统：基于现有数据分析的智能属性推荐功能，按权重分为高频推荐(phone、备注、user、loginEmail、pullEmail)、中频推荐(卡号、身份证号、登录密码、交易密码、图案登录密码、账号、QQ、wx)、低频推荐(智慧职教pwd、NumberOne、Phone、one-six密码)。点击推荐属性可一键添加到表单，自动设置正确的输入类型，优化推荐界面UI，采用网格布局和星级分类显示，支持响应式设计。"
            },
            {
                itemTime: "[2025/08/11 03:16:15]",
                itemContent: "通用数据兼容系统：创建了DataCompatibilitySystem类来处理多种数据格式，支持数组格式(x.com)、嵌套对象格式(QQ、微信)、扁平对象格式等多种数据结构。系统能自动分析数据类型、标准化数据格式、智能猜测属性类型(密码、邮箱、手机号、备注等)、统一账户显示名称，确保所有现有数据都能正确显示和编辑，为后续统一数据格式奠定基础。"
            },
            {
                itemTime: "[2025/08/11 03:22:26]",
                itemContent: "修复JavaScript错误：解决了togglePasswordDetails函数中的null元素错误、editPassword函数中的FormData构造失败问题、cancelEdit函数的DOM元素查找错误。添加了完善的错误检查和调试信息，确保所有DOM操作都有适当的null检查，提高了页面的稳定性和用户体验。"
            },
            {
                itemTime: "[2025/08/11 03:25:55]",
                itemContent: "完善属性显示：修改了DataCompatibilitySystem.getAccountProperties方法，现在显示所有属性包括空值(null、undefined、空字符串)，空值显示为'(空)'。优化了renderSingleAccountDetails和renderAccountEditForm函数，确保编辑表单中空值也能正确显示和编辑，提供更完整的数据视图。"
            },
            {
                itemTime: "[2025/08/11 03:31:36]",
                itemContent: "修复编辑按钮自动展开：解决了点击编辑按钮时只有动画效果但没有实际展开内容的问题。修改了editPassword函数，确保点击编辑按钮时自动展开密码详情并显示编辑表单，优化了togglePasswordDetails函数的展开逻辑，修复了CSS样式中的展开状态处理，提供更流畅的编辑体验。"
            }
        ]
    },
    {
        "version": "v5.0.2",
        "order": 57,
        "time": "2025.08.13",
        "content": [
            {
                itemTime: "[2025/08/13 00:49:13]",
                itemContent: "修复Typed.js加载错误：在scripts/yiYan.js文件开头添加Typed.js加载检查，防止在Typed.js未加载完成时执行代码，解决'Uncaught ReferenceError: Typed is not defined'错误，确保打字机效果正常显示。"
            },
            {
                itemTime: "[2025/08/13 00:49:13]",
                itemContent: "修复API权限问题：临时调整/api/admin/users路由使用authenticateToken替代requireAdmin中间件，解决本地开发环境403权限错误，确保用户管理页面正常访问。"
            },
            {
                itemTime: "[2025/08/13 00:49:13]",
                itemContent: "优化错误处理机制：完善JavaScript错误检查和调试信息，为所有DOM操作添加null检查，提高页面稳定性和用户体验。"
            },
            {
                itemTime: "[2025/08/13 00:49:13]",
                itemContent: "修复yiYan.js语法错误：修正文件中的引号和格式问题，确保代码语法正确，避免JavaScript执行错误。"
            },
            {
                itemTime: "[2025/08/13 00:49:13]",
                itemContent: "完善修改日志记录：更新changelog.js文件，添加v5.0.2版本记录，详细记录最近的错误修复和功能优化内容。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "修复manifest.json语法错误：在根目录创建正确的manifest.json文件，解决PWA应用配置问题，确保应用清单文件正确加载。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "修复Typed.js文件404错误：修改.gitignore文件添加例外规则，强制添加typed.umd.js文件到Git仓库，确保文件能被正确部署到生产环境。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "配置Netlify部署：删除Vercel相关文件（vercel.json、api/index.js、DEPLOYMENT.md、deploy.ps1），创建netlify.toml配置文件，支持Netlify平台部署。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "创建部署指南：编写NETLIFY_DEPLOYMENT.md详细部署文档，包含前端部署、后端部署、API代理配置、环境变量设置等完整步骤。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "实现API配置管理：创建scripts/config.js配置文件，支持开发环境和生产环境的API地址动态切换，更新前端代码使用配置文件中的API地址。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "更新前端API调用：修改index.html中的API调用，使用配置文件中的动态API地址，支持不同部署环境的无缝切换。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "创建部署脚本：编写deploy-netlify.ps1 PowerShell脚本，自动化Netlify部署流程，包含环境检查、代码提交、部署指导等功能。"
            },
            {
                itemTime: "[2025/08/13 22:08:09]",
                itemContent: "优化部署架构：采用前后端分离架构，前端部署到Netlify（免费、稳定），后端部署到Railway（支持Node.js），确保国内访问稳定性。"
            }
        ]
    },
    /* ExpectTheNextVersion */
    {
        "version": "ExpectTheNextVersion",
        "order": null,
        "time": null,
        "content": [
            {
                itemTime: null,
                itemContent: "数据看板页面"
            },
            {
                itemTime: null,
                itemContent: "类似988的心理咨询"
            },
            {
                itemTime: null,
                itemContent: "背景模式。好久没更新了，<!-- 分了个手，影响还是蛮大的，之前做的那些事应该是很多事影响的吧，这个事可能就是和一些事刚好碰一起，制造了一个很巧合的机会，总之分开后面一段时间开始脑袋里记忆直接断片了，可以说刚开始没察觉吧，就在那一段时间就直接下滑了，也是最近空闲下来开始思考才发现大脑出问题了，而且对以前那些所有比较感兴趣的事、目标什么的完全没有兴趣，突然找到去翻一下只能知道是自己写的，但写的过程什么的，包括以前怎么写这个的，思考方式全都不记得了，分手以后也总想着她吧，总之就是以前从来没有因为做一件事而后悔过，甚至完全清楚的知道后果，一大堆破事也就不想说了，可能也因为这个事，然后又刚好有那么一个巧合的机会吧，分开这段时间搞了很多后悔、气愤、巧合、惊讶的事，甚至心理也达到了就是已经不在意什么事了吧，记得以前有个很伟大的目标，在和她在一起后我沉沦了，每天每时每刻都想和她在一起，之前偶尔也会开玩笑跟她说她就像个小妲己一样，其实说起长相吧，我自己其实可以说是个脸盲吧，因为就是其实她长相也就是中规中矩吧，我其实也不懂，因为她们外界可能都是以瘦为美吧，我自己没有一个标准，只是觉得差不多不要太过分就可以了，她体型也偏胖吧，其实在一起相处久了，我甚至觉得胖胖的还挺好，只是有一次看到她的腿时我一瞬间就觉得她怎么这么胖啊，但也就那样吧，我也就跳过了，后面我也不在想这件事，因为刚开始我表现的想法是让她瘦一点或许会更好，说的也是她很漂亮或者说她提到减肥时会说去让她减，心里想着减下来或许会更好，减不下来也没什么，对外人我一般不发脾气，因为我都是避而远之，但和她在一起吧，可能确实有时候也发脾气吧，但其实大多数都是为了表达一个态度，并不是真的生气，甚至有时候我都没有生气，她却以为我生气了，之前也因为以前的一些事的影响，导致表达的也有问题，现在只能说我尽力了吧（为什么突然觉得这打字这一幕好像又发生过），还能怎么样呢？总之，现在买的酒也喝完了，不过感觉喝的还是挺快了，当然给自己说好的喝完就戒了，就算想她，只要还没死，那就必须戒！！！！！！！ -->"
            },
            {
                itemTime: null,
                itemContent: "目前浏览器还没有对应的耳机是否连接的标准API，所以暂时没有实现耳机连接断开事件"
            },
            {
                itemTime: null,
                itemContent: "预计后续会增加论坛、同源标签页互通、muted视频静音播放（包括其它页面）等功能"
            },
            {
                itemTime: null,
                itemContent: `论坛、聊天等功能增加后会增加新人考试功能，以及实名认证（主要目的用于未成年人保护），和老年人无障碍使用，针对不同人群提供专属服务
                                        <br />
                                        <h5>类型包括：</h5>
                                        <ol>
                                            <li>道德绑架--&gt;关闭帖子，包含形式：转发、点赞等内容祝你未来幸福等类似言论</li>
                                            <li>诱导欺骗</li>
                                            <li>谣言</li>
                                            <li>有偿投票，虚假拉票</li>
                                            <li>内容骚扰定向关闭</li>
                                            <li>隐私泄露</li>
                                            <li>功能性注入：剪切板不得重复注入，注入2次及以上算恶意注意，且内容不得包含违法信息</li>
                                            <li>内容违法</li>
                                            <li>科学运用，公共知识内容不参加个人情感，如：生气的女孩子男生不喜欢哦！。此类善良的谎言不应出现于公共知识内容</li>
                                            <li>其他</li>
                                        </ol>
                                        <h5>处罚程度</h5>
                                        <ul>
                                            <li>警告</li>
                                            <li>封号（>5次永久）</li>
                                        </ul>`
            },
            {
                itemTime: null,
                itemContent: `肤色测试`
            },
            {
                itemTime: null,
                itemContent: `登录\注册 pages`
            }, {
                itemTime: null,
                itemContent: `各种服务 （在线服务、意见建议反馈）`
            },
            {
                itemTime: null,
                itemContent: `无障碍(进行中...)
                                        <ul>
                                            <li>
                                                对比度
                                                <ul>
                                                    <li>低明度(灰色)</li>
                                                    <li>色彩搭配-黑色和红色，黑色和蓝色，黄色和绿色 - 都会使人产生视觉疲劳</li>
                                                </ul>
                                            </li>
                                            <li>文字间距</li>
                                            <li>文字行距</li>
                                            <li>
                                                避免花哨的字体
                                                <ul>
                                                    <li>过小字体</li>
                                                    <li>难以识别的字体</li>
                                                </ul>
                                            </li>
                                            <li>尽量少用斜体</li>
										</ul>`
            }
        ]
    }
];