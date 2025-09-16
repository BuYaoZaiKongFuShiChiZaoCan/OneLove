const audioMv = document.querySelector("#audioMvPanel");
const posterLuYou = './music/mv/poster/'

/**
 * mvList  视频列表
 * @param {string} id 对应songs的歌曲名称
 * @param {string} type 文件类型 一般为video/mp4
 * @param {string} title 视频标题
 * @param {string} srcLocalhost 视频本服务器播放地址
 * @param {string} srcNetwork 其他服务器视频播放地址
 * @param {string} poster 视频封面
 * @param {string} desc 视频简介
 * @param {string} id 对应songs的歌曲名称
 * @returns {null} 无返回
 */
let mvList = [
	{
		id: "浮夸-陈奕迅",
		type: "video/mp4",
		title: "【𝟖𝐊_𝟔𝟎𝐅𝐏𝐒】《浮夸》2010DUO演唱会 现场版",
		srcLocalhost: "./music/mv/浮夸-陈奕迅.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【𝟖𝐊_𝟔𝟎𝐅𝐏𝐒】极限画质_史上最炸裂《浮夸》!没有之一!.浮夸.546484128 《浮夸》现场版，演唱陈奕迅，粵语经典歌曲，太好听了来源 qq.com · 时长 4 分钟35 秒 · 上传时间 2021年2月7日 · 上传人 娟子v音乐"
		// 上传时间
		// 上传人
		// 播放量
		// 弹幕[{time,info{text,style},{发布人,发布地点...},{弹幕点赞量、弹幕回复}}]
	},
	{
		id: "Nathan Evans - Wellerman (Sea Shanty)",
		type: "video/mp4",
		title: "Nathan Evans - Wellerman (Sea Shanty)",
		srcLocalhost: "./music/mv/Nathan Evans - Wellerman (Sea Shanty).mp4",
		srcNetwork: "https://www.kuaishou.com/profile/3xv4pcbm9mvv77k",// @Mushini 
		srcNetworkTwo: "https://www.youtube.com/watch?v=qP-7GNoDJ5c",
		srcNetworkThree: "https://www.youtube.com/watch?v=90Oc9Xl5Aps",
		srcNetworkFour: "https://www.youtube.com/watch?v=lLGLUSzzuWU",
		poster: null,
		desc: "《Wellerman》是新西兰民谣，最早由新西兰的捕鲸船员在19世纪40年代创作。歌曲讲述了捕鲸船员们在海上等待补给船“Wellerman”到来的故事。"
	},
	{
		id: "小咪-我走后",
		type: "video/mp4",
		title: "小咪《我走后》完整版高清mv",
		srcLocalhost: "./music/mv/小咪《我走后》完整版高清mv.mp4",
		srcNetwork: null,
		poster: null,
		desc: "小咪《我走后》完整版高清mv #小咪我走后 #我走后完整版 - 抖音。《我走后》是一首由小咪创作和演唱的情歌，表达了一段过客的爱情和分离的心情。歌词中反复出现“我走后”这个词，表示对对方的不舍和祝福，收录在专辑《我走后》中。"
	},
	{
		id: "戴羽彤-来迟",
		type: "video/mp4",
		title: "戴羽彤-来迟_MV_4K_CD音质",
		srcLocalhost: "./music/mv/戴羽彤-来迟_MV_4K_CD音质.mp4",
		srcNetwork: null,
		poster: posterLuYou + "戴羽彤-来迟_MV_4K_CD音质.jpeg",
		desc: "来迟是戴羽彤的一首歌曲，由卡文填词，三珊谱曲，筱明编曲，一寸光年团队制作。歌词表达了一种错过爱情的悲哀和后悔，反复唱出“我这一次终究还是来得太迟”。"
	},
	{
		id: "精忠报国-洪屠刚",
		type: "video/mp4",
		title: "【精忠报国】洪屠刚",
		srcLocalhost: "./music/mv/屠洪刚《精忠报国》MV_高清1080P在线观看平台_腾讯视频.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《精忠报国》"

	},
	{
		id: "别怕我伤心-张信哲",
		type: "video/mp4",
		title: "【4K修复】《别怕我伤心》张信哲_60FPS(高保真音质)",
		srcLocalhost: "./music/mv/【4K修复】《别怕我伤心》张信哲_MV_60FPS(高保真音质).mp4",
		srcNetwork: null,
		poster: null,
		desc: "《别怕我伤心》是由李宗盛作词并作曲，张信哲演唱的歌曲，收录于张信哲1994年6月1日发行的专辑《等待》中。"
	},
	{
		id: "胡彦斌-你要的全拿走",
		type: "video/mp4",
		title: "【胡彦斌】你要的全拿走",
		srcLocalhost: "./music/mv/【胡彦斌】你要的全拿走MV.mp4",
		srcNetwork: null,
		poster: null,
		desc: "2018年胡彦斌演唱的歌曲。《你要的全拿走》是胡彦斌演唱的一首歌曲，由胡彦斌作词、作曲，谷粟编曲，收录在胡彦斌2018年1月23日发行的专辑《覅忒好》中 。"
	},
	{
		id: "说了再见-周杰伦",
		type: "video/mp4",
		title: "4K·重制周杰伦《说了再见》MV 修复版",
		srcLocalhost: "./music/mv/4K·重制周杰伦《说了再见》MV 修复版.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《说了再见》是周杰伦演唱的一首流行歌曲，收录于他2010年发行的专辑《跨时代》中。 这首歌由周杰伦作曲，古小力和黄凌嘉共同作词，钟兴民负责编曲。 这首歌也是李连杰主演的电影《海洋天堂》的主题曲。 歌词描述了在雨中天亮后，主人公面对失去所爱之人的痛苦，试图放下过去，却发现再也无法与对方相见。 歌词中充满了对失去的微笑、幸福时光的怀念以及对再次拥抱和陪伴的渴望。"
	},
	{
		id: "童话镇-苗疆少女",
		type: "video/mp4",
		title: "童话镇-苗疆少女",
		srcLocalhost: "./music/mv/童话镇-苗疆少女.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《童话镇》 里湘纯子版"
	},
	{
		id: "王菲 - 匆匆那年",
		type: "video/mp4",
		title: "王菲 - 匆匆那年",
		srcLocalhost: "./music/mv/王菲 - 匆匆那年.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《匆匆那年》是王菲演唱的歌曲，由林夕作词，梁翘柏作曲。该曲也是电影《匆匆那年》的主题曲，2014年11月5日以单曲的形式发行。该曲以影片主人公陈寻（彭于晏饰）和方茴（倪妮饰）跨越15年的情感历程为蓝本，讲述了两人从相识到相恋，从分开到回忆的情感全过程。该曲意境密切贴合影片的故事情节，直击人心，加上王菲的演绎更令人动容"
	},
	{
		id: "体面-于文文",
		type: "video/mp4",
		title: "《前任3：再见前任》电影插曲 体面-于文文",
		srcLocalhost: "./music/mv/体面-于文文.mp4",
		srcNetwork: "https://tv.sohu.com/v/dXMvMzQ2NjQwNzg3LzQyMjA0MzQ2OS5zaHRtbA==.html",
		poster: null,
		desc: "《体面》由于文文作曲并演唱，唐恬作词，郑楠编曲，单曲于2017年12月25日发行，是电影《前任3：再见前任》的插曲。 后收录在于文文于2018年11月7日发行的专辑《尚未界定》中。 2018年4月8日，该曲获第23届华鼎奖中国电影最佳歌曲奖；8月29日，该歌曲获得华人歌曲音乐盛典年度金曲；12月18日，获得Billboard Radio China 2018年度华语十大金曲。"
	},
	{
		id: "说散就散-袁娅维TIA RAY",
		type: "video/mp4",
		title: "《前任3：再见前任》电影插曲 《说散就散》",
		srcLocalhost: "./music/mv/说散就散-袁娅维.mp4",
		srcNetwork: "https://music.163.com/#/mv?id=5741462",
		poster: null,
		desc: "袁娅维献声电影《前任3：再见前任》「灵魂新锋」TIA袁娅维再度为爱献声，剖心演绎最催人泪下版《说散就散》。电影「前任3：再见前任」主题曲《说散就散》洒脱上线"
	},
	{
		id: "挪威的森林-伍佰",
		type: "video/mp4",
		title: "挪威的森林 伍佰",
		srcLocalhost: "./music/mv/挪威的森林-伍佰.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《挪威的森林》是由伍佰创作词曲并演唱的流行摇滚歌曲，由伍佰与China Blue乐队共同编曲，收录在伍佰&China Blue于1996年6月18日发行的专辑《爱情的尽头》中 。创作灵感来源于日本作家村上春树出版的同名长篇小说《挪威的森林》，是伍佰有感而发创作出的歌曲。伍佰音乐生涯中传唱度最高的音乐作品。"
	},
	{
		id: "坟草钢木",
		type: "video/mp4",
		title: "坟草钢木",
		srcLocalhost: "./music/mv/坟草钢木.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《坟草钢木》"
	},
	{
		id: "孙楠-拯救",
		type: "video/mp4",
		title: "【最高音质】孙楠《拯救》MV_1080P_60FPS_(CD音轨)",
		srcLocalhost: "./music/mv/孙楠-拯救.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《拯救》是孙楠演唱的歌曲，由梁芒作词，周笛作曲，收录在孙楠2002年10月1日发行的专辑《缘分的天空》中。该曲是电视剧《爱我你怕了吗》的片头曲。2003年03月28日，该歌曲获得第三届音乐风云榜“内地年度十大金曲”奖；2010年04月11日，该歌曲获得第十届音乐风云榜十年盛典“内地十年十大金曲”奖。"
	},
	{
		id: "曹操-林俊杰",
		type: "video/mp4",
		title: "《曹操》林俊杰_经典MV,读三国,听曹操",
		srcLocalhost: "./music/mv/曹操-林俊杰.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《曹操》是林俊杰演唱的摇滚歌曲，由林秋离作词，林俊杰作曲，Kenn C编曲，收录在林俊杰于2006年2月17日发行的同名专辑《曹操》中。"
	},
	{
		id: "林忆莲-至少还有你",
		type: "video/mp4",
		title: "《至少还有你》林忆莲 官方MV",
		srcLocalhost: "./music/mv/至少还有你-林忆莲.mp4",
		srcNetwork: null,
		poster: null,
		desc: `《至少还有你》是由林夕作词，Davy Chan（陈匡荣）作曲，刘志远编曲，林忆莲演唱的歌曲，收录于林忆莲2000年1月18日发行的专辑《林忆莲"s》中。该曲是电影《安娜与国王》的中文主题曲。《至少还有你》的歌词，写的是两个人相爱的感受。该曲是一首预言歌，也是唱给生命中的另一条伏线；是聪明的选择，也是一种相互信任的态度。2001年，该曲获得首届华语流行乐传媒大奖。2010年，该曲获得港台十年十大金曲。`
	},
	{
		id: "李克勤-护花使者",
		type: "video/mp4",
		title: "李克勤-护花使者",
		srcLocalhost: "./music/mv/李克勤-护花使者.mp4",
		srcNetwork: null,
		poster: null,
		desc: `《护花使者》是中国香港男歌手李克勤演唱的粤语歌曲，由长谷川集平作曲，潘伟源填词，苏德华编曲，收录在李克勤于1991年6月9日通过环球唱片发行的粤语专辑《雨中街头剧》中。《护花使者》改编自日本Sement Mixers组合的《真っ赤な夕阳が燃えている》，该曲节奏感强烈，动感十足，旋律欢快，往往在听众心情低落时，能够激发人们的活力，让人忘却烦恼与忧伤。前奏一响，便足以唤醒人们内心深处的旋律记忆，成为不少人心中的“表白金曲”。1992年1月19日，该曲获得了1991年度十大劲歌金曲“最佳音乐录影带演出”奖。此后，在2018年、2020年与2024年，李克勤分别在梦圆东方·2019东方卫视跨年盛典、2021江苏卫视跨年演唱会以及“湾区升明月”2024大湾区电影音乐晚会上，现场演绎了这首标志性曲目"。`
	}
]

/**
 * 主函数
 * @param {object} musicInfo 音乐信息
 * @param {boolean} autoplay 是否自动播放
 * @returns {null} 无返回
 */
function audioMvmain(musicInfo = findMusic(title.textContent), autoplay = true) {
	let audioMvVideo1Element = window.audioMvVideo1;
	let video = null;
	if (!audioMvVideo1Element) {
		// 创建一个video元素
		video = document.createElement("video");
		// 设置ID为audioMvVideo
		video.id = "audioMvVideo1";
		video.className = "audioMvVideo";
		// 设置样式
		// video.style.cssText = ``;
		// 设置src属性为视频地址
		video.src = musicInfo.srcLocalhost;
		// 设置自动播放
		video.autoplay = autoplay;
		// 设置循环播放
		// video.loop = true;
		// 设置静音播放
		// video.muted = true;
		// 设置音量
		// video.volume = 0.5;
		// 预加载
		// video.preload = "auto";
		// 控制条
		video.controls = true;
	} else {
		// 如果视频元素已经存在直接改属性就行了
		audioMvVideo1Element.src = musicInfo.srcLocalhost;
	}
	// 视频封面
	musicInfo.poster && (video.poster = musicInfo.poster);
	// musicInfo.poster ? video.poster = musicInfo.poster : void 0;
	// 视频类型
	video.type = musicInfo.type;
	audioMv.appendChild(video);
	// 元素加载完成后
	video.onload = function () {
		video.play()
	};
	video.onplay = function () {
		// 设置音乐进度为视频进度
		let savedTime = parseFloat(window.localStorage.getItem("musicTime")) || 0;
		if (savedTime > 0 && savedTime < video.duration) {
			video.currentTime = savedTime;
		}
		pauseSong();
		// 视频最大化
		video.webkitRequestFullScreen(); // 放在这里能有效解决播放时视频全屏无法全屏的问题
	};
	video.onpause = function () {
		// 设置音乐进度为视频进度
		// window.localStorage.setItem("musicTime", video.currentTime); // 这里取消是因为在切换音乐的时候会影响到loaclstorage的修改，所有不得不取消在视频暂停时设置，因为切换时必须要更改，所以这里还不能在切换时设置它
	};
	video.onended = function () {
		lastChange === "prevSong" ? prevSong() : nextSong();
	};
	// 添加标题等表述元素
	let title = document.createElement("h3");
	title.classList.add("audioMvTitle");
	title.textContent = musicInfo.title;
	let desc = document.createElement("p");
	desc.classList.add("audioMvDesc");
	desc.textContent = musicInfo.desc;
	audioMv.appendChild(title);
	audioMv.appendChild(desc);
}

// 更新video元素
function updateVideo() {
	let video = document.querySelector("#audioMvVideo1");
	if (video) {
		// 判断如果video.src包含title.textContent
		if (decodeURIComponent(video.src).includes(title.textContent)) {
			window.localStorage.setItem("musicTime", video.currentTime);
		} else {
			// 移除#audioMvPanel中的所有元素
			audioMv.textContent = "";
		}
	}
}

// 查找ID与歌曲对应的元素
function findMusic(id) {
	for (let i = 0; i < mvList.length; i++) {
		if (mvList[i].id == id) {
			return mvList[i];
		}
	}
}

// 页面加载初始化判断有没有视频
// 判断视频是否存在于显示的列表
if (musicinfo = findMusic(title.textContent)) {
	// Mv 有MV的歌曲会切换后会优先自动播放MV
	audioMvmain(musicinfo, false);
} else {
	// tanChuang("此歌曲暂无MV");
	// playSong(); // 默认不播放音乐
}

let videoList = [
	{
		"name": "《尸潮往生录》惊变/余阳",
		"img": "https://img2.imgtp.com/2024/05/11/iChli8Cf.webp",
		"id": "403716b135021b8f7b8acce874bb5ba1"
	},
	{
		"name": "韩国丧尸电影《活着》",
		"img": "https://img2.imgtp.com/2024/05/11/qLe1RGIk.jpg",
		"id": "56bc99ca189b42408bfeecfa92318f03"
	},
	{
		"name": "盗盗梦空间1080P",
		"img": "https://img2.imgtp.com/2024/05/11/kxXW3VE5.webp",
		"id": "c84e297fa4b3b60ab6f3cafaa9022677"
	},
	{
		"name": "破坏者",
		"img": "https://img2.imgtp.com/2024/05/11/BEmf4kJu.webp",
		"id": "1d4ccb0c93809148ddf4ca30ff18139a"
	},
	{
		"name": "暗影青梅",
		"img": "https://img2.imgtp.com/2024/05/11/Lv1306sm.webp",
		"id": "133c665625a9c0e08be813bfbd33c700"
	},
	{
		"name": "纯爱军训",
		"img": "https://img2.imgtp.com/2024/05/11/l75k39g1.PNG",
		"id": "e57b3094e5ba411573b7a3118804b207"
	},
	{
		"name": "丧尸来敲门",
		"img": "https://img2.imgtp.com/2024/05/11/0gnZ35T4.webp",
		"id": "17d8890b69079e975c5b9da9ba4372ff"
	}
]