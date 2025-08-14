# <center>壹比零</center>

---

我的版本记录存在云端，你需要更具项目进度修改，时间运行终端Get-Date -Format "yyyy-MM-dd HH:mm:ss"获取最新时间精确到秒。终端不支持&&符号，需要请分两次执行。不要用1)这种序号，像前面一样简单描述就行。然后阅读OneLove项目开发指南.md和项目及关联文件了解项目进度


## 观念

世界观：平衡生态链利益，构建命运共同体
价值观：诚信、创新、利润合理化、非特殊情况客户至上
使命观：让知识分享变得简单高效，连接每一个求知者
愿景观：成为最受信赖的数字化知识分享平台
全球观：融入国际化竞争与合作

既要本我、又要自我、更要超我，做真实自己，有人情味

## 介绍

### 平台定位
一个专注分享的平台，致力于为用户提供优质的知识分享和资源获取体验。

### 关于名称
官网名称：壹比零
检索名称：一比零
数字名称：1:0
英文名称：OneLove

#### 名称寓意
一比零，即是开始，也是结束。1:0即表示男女性别1和0相等，又表示彼此的区别。且包含二进制编程0和1的表示利用互联网传播和实际行动表达对世界的改变，对宇宙的探索的决心。此外1中间隔一个冒号，就好像1和0背靠背，如同蓝颜知己，有知己，0为生，则1:0，没有知己，0为空，同样还是1:0。

#### 名称来源
名称Onelove来源：[为什么奥运会裁判报分时把1:0称为one love？](https://language.chinadaily.com.cn/a/202108/02/WS61079685a310efa1bd6660b4.html)

#### 开发者信息
开发者：祁富强
笔名：慕枭渊

### 项目特色
- **技术驱动**: 采用现代化Web技术，注重性能和用户体验
- **内容为王**: 专注于优质内容的分享和传播
- **用户至上**: 以用户需求为中心，持续优化产品体验
- **开放共享**: 倡导知识开放，促进信息流通

### 主题曲构思
面向大众化，情绪不能太极端，又不想太严肃显得很装很古板，所以气氛要活跃一点，大概像bum bum bole差不多，但这个好像又太过头了 ...

**建议方向**：
- 轻快但不失内涵的旋律
- 体现"分享"和"连接"的主题
- 适合多年龄段用户

### 发展现状
**当下问题**：前期发展利润来源途径

**解决思路**：
- 探索多元化盈利模式
- 建立可持续的商业模式
- 平衡用户体验与商业价值

### 关于教程
1. 以列表为格式展示，教程可以以视频、文档、音频等形式展示，展示优先级为视频优先，文档其次，音频最后。视频原存储应选高清原创内容，最低720p。
2. 目的是要达到会用、还要懂。
    1. 所以先出小白入门系列教程【前言、历史发展提兴趣、基本使用入门教程】，大概了解要学习的这个东西。
    2. 通过实践的方法去学它的使用【其实这世界很多东西都不难，毕竟真正难的大多数人都不感兴趣，所以接下来要学的只是非常简单的东西，实践出真知。步骤1如果是已经了解了这个东西可以大概看一遍或者跳过1直接第2步，建议还是看一下】
        + 实践的方法学习会分为**基础**和**进阶**两套，前期基础主实战，进阶在实战基础上加部分理论。
    3. 教科书式学习，学习完整的知识框架，彻底了解，不做不明不白的人【其实前两步学完基本就可以之间去干了，但偶尔有时候还是会有一些小问题，不过已经超过95%的普通人，80%的同行，第三步就是把系列完整的框架等知识全部讲给你，不过像一些平时自己玩的或者利用技能去工作的第二步完全掌握以后就可以去找工作了，当然感兴趣可以再深入学习一下3】

遵旨：实力即最好的宣传，加速数字化世界建设，用数字化代替人力，增进万物幸福感。

## 关于信息资讯
1. 信息内容很多，推荐就必须要有一个指标，信息指标标准：
    1. 信息及时性：根据发布时间定义一个权重，以及资讯的推荐过期时间
    2. 信息价值：根据内容的重要程度定义一个权重
2. 推荐内容分类：
    1. 官方认证资讯类型
        1. 本站
        2. 发布者
        3. 作者【用户指标权重】
    2. 国际
    3. 财经
    4. 科技
    5. 思想
    6. 生活
    7. 娱乐
        1. 音乐【听】
        2. 舞蹈【动】
        3. 小说【看】
        4. 漫画【看】
        5. 游戏【玩】
    8. 体育
3. 违规资讯发布惩罚机制
    1. 违规标准评定
    2. 违规处罚规则

## 标志物
1. 丝光椋鸟
2. 花椒

## 使用NProgress
```javascript
// 配置NProgress
NProgress.configure({ showSpinner: true }) // 是否显示右上角螺旋加载提示
NProgress.configure({ minimum: 0.08, showSpinner: true, parent: '#box1' })

// 在路由守卫中使用NProgress
NProgress.start() // 开启进度条
NProgress.set(n) // 设置进度条的百分比，其中n是0到1之间的数字
NProgress.done() // 关闭进度条 
NProgress.inc() // 随机增加进度条的进度，但不会达到100%
```

## 用到的API
#### 来自：https://api.aa1.cn/
```cs
API1：随机搞笑文案v2
    请求示例：https://zj.v.api.aa1.cn/api/wenan-gaoxiao/?type=text
    请求方式：get
    参数：
        type：返回的格式json||text
    返回值：
        json格式：
            {
                "msg": "好不容易习惯了自己的长相，理了个发，又换了一种丑法。"
            }
        text格式：
            好不容易习惯了自己的长相，理了个发，又换了一种丑法。
```
```cs
API2：获取抖音主页前三个视频
    请求示例：https://v.api.aa1.cn/api/douyin/zp/?url=https://www.douyin.com/user/MS4wLjABAAAAKlLQ6XV_1dKsI1YIVYYbdsOosl2vDOG_CH23hF3Ofa0
    请求方式：get
    参数：
        url：抖音主页地址
    返回值：
        {
            "code": 200,
            "msg": "获取成功",
            "count": 3,
            "data": [
                {
                    "desc": "你觉得这场系列赛最终大比分会是多少？#湖人 #詹姆斯",
                    "videourl": "https://www.douyin.com/video/7234749568917753123"
                },
                {
                    "desc": "08年北京奥运会#姚明 高情商回答外媒采访，这就是中国的精神面貌！#中国男篮",
                    "videourl": "https://www.douyin.com/video/7216292579736964352"
                },
                {
                    "desc": "乔丹篮球世家的基因有多强大？原来乔丹妈妈会扣篮！#乔丹 #搞笑nba #篮球",
                    "videourl": "https://www.douyin.com/video/7213784406459272459"
                }
            ]
        }
```
```cs
API3：各类帅哥视频
    请求示例：https://www.mnapi.cn/sg.php?type=video
    请求方式：get
    参数：
        type：video
    返回值：
        {
            "video": "返回视频"
        }
```
```cs
API4：bmi指数计算器（官方）
    请求示例：https://www.apii.cn/api/huaiyun/te/?weight=100&height=175
    请求方式：get
    参数：
        weight：公斤（kg）
        height：厘米（cm）
    返回值：
        json格式：
            {
                "code": 200,
                "msg": "您很胖，减肥已是您的头等大事！",
                "bmi": "32.65"
            }
```

<br />

<center>版权所有 ©壹比零</center>

---

## 页面结构分析

### 🏗️ **主要结构层次**

1. **文档头部 (`<head>`)**
   - SEO元数据配置
   - CSS样式文件引入
   - 字体图标库
   - PWA配置
   - 加载进度条配置

2. **页面主体 (`<body>`)**
   - **头部区域 (`#header`)**
     - 菜单按钮 (`#menuButton`)
     - Logo按钮 (`#logoButton`)
     - 导航菜单 (`<nav>`)

   - **搜索区域**
     - 搜索输入框 (`#input`)
     - 清除按钮 (`#clear`)
     - 搜索建议列表 (`#searchSuggest`)
     - 头像 (`#profilePicture`)

   - **侧边菜单 (`#sideMenu`)**
     - 时钟音频控制
     - 秒针声音开关

   - **主要内容区域 (`#main-body`)**
     - **时间显示区域 (`#time`)**
       - 时钟面板 (`#clockPanel`)
       - 时间文本显示

     - **重要事项区域 (`#Center`)**
       - 重要输入框 (`#importantInput`)
       - 确认按钮 (`#mainButton`)

     - **MV面板 (`#audioMvPanel`)**

     - **侧边面板 (`#sidePanel`)**
       - **第一块 (`#cbOne`)**: 访问统计
       - **第三块 (`#cbThree`)**: 音乐播放器
         - 音乐容器 (`#music-container`)
         - 标题滚动 (`#title`)
         - 进度条 (`#progress-container`, `#progress`)
         - 音频元素 (`#audio`)
         - 封面图片 (`#music-cover`, `#playBgImg`)
         - 控制按钮 (`#prev`, `#play`, `#next`)
         - 歌词面板 (`#lyricPanel`, `#lrc`)
         - 播放列表 (`#musicList`, `#playlistPanel`)
         - 提示框 (`#tipBox`)

       - **第四块 (`#cbFour`)**: 雅言打字效果
       - **第五块 (`#cbFive`)**: 其他内容

   - **页脚 (`<footer>`)**
     - 版权信息
     - 公安备案图标

   - **对话框 (`#dog`)**: 最大化窗口

### 🎵 **音乐播放器结构**

```html
<div id="music-container">
  <div class="music-info">
    <marquee id="title">歌曲标题</marquee>
    <div id="progress-container">
      <div id="progress"></div>
    </div>
  </div>
  <audio id="audio" preload="auto"></audio>
  <div class="img-container">
    <img id="music-cover" />
    <img id="playBgImg" />
  </div>
  <div class="navigation">
    <button id="prev">上一首</button>
    <button id="play">播放/暂停</button>
    <button id="next">下一首</button>
  </div>
</div>
```

### 📱 **响应式设计**

- 使用媒体查询适配不同屏幕尺寸
- 菜单按钮在移动端显示，Logo在桌面端显示
- 窗口大小变化时动态调整布局

### 🔧 **脚本加载顺序**

1. 基础功能脚本 (`header.js`, `clockAudio.js`)
2. 搜索和键盘事件脚本
3. 音乐相关脚本 (`audioList.js`, `audio.js`, `audioMv.js`)
4. 窗口事件脚本 (`window.on.js`)
5. 扩展功能脚本 (`maxScreen.js`, `clickOnPopupText.js`)

### ⚡ **性能优化**

- 使用 `NProgress` 显示加载进度
- 脚本使用 `defer` 属性异步加载
- 图片使用 `loading="lazy"` 懒加载
- PWA支持离线访问

页面结构设计合理，功能模块化清晰，具有良好的用户体验和性能优化。