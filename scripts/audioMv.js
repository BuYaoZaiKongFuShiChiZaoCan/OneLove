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
		poster: "./music/audio/浮夸-陈奕迅.png",
		desc: "【𝟖𝐊_𝟔𝟎𝐅𝐏𝐒】极限画质_史上最炸裂《浮夸》!没有之一!.浮夸.546484128 《浮夸》现场版，演唱陈奕迅，粵语经典歌曲，太好听了来源 qq.com · 时长 4 分钟35 秒 · 上传时间 2021年2月7日 · 上传人 娟子v音乐"
		// 上传时间
		// 上传人
		// 播放量
		// 弹幕[{time,info{text,style},{发布人,发布地点...},{弹幕点赞量、弹幕回复}}]
	},
	{
		id: "We Will Rock You",
		type: "video/mp4",
		title: "We Will Rock You",
		srcLocalhost: "./music/mv/We Will Rock You.mp4",
		srcNetwork: null,
		poster: null,
		desc: "We Will Rock You"
	},
	{
		id: "Wellerman-NathanEvans(Sea_Shanty)",
		type: "video/mp4",
		title: "Wellerman-NathanEvans(Sea_Shanty)",
		srcLocalhost: "./music/mv/Wellerman-NathanEvans(Sea_Shanty).mp4",
		srcNetwork: "https://www.kuaishou.com/profile/3xv4pcbm9mvv77k",// @Mushini 
		srcNetworkTwo: "https://www.youtube.com/watch?v=qP-7GNoDJ5c",
		srcNetworkThree: "https://www.youtube.com/watch?v=90Oc9Xl5Aps",
		srcNetworkFour: "https://www.youtube.com/watch?v=lLGLUSzzuWU",
		poster: null,
		desc: "《Wellerman》是新西兰民谣，最早由新西兰的捕鲸船员在19世纪40年代创作。歌曲讲述了捕鲸船员们在海上等待补给船“Wellerman”到来的故事。"
	},
	{
		id: "留什么给你(Live)-孙楠",
		type: "video/mp4",
		title: "《留什么给你》",
		srcLocalhost: "./music/mv/留什么给你-2.mp4",
		srcNetwork: "./music/mv/留什么给你.mp4",
		poster: null,
		desc: "#初念 #意难平 #白月光 #意想不到的结局 留什么给你"
	},
	{
		id: "《人世间》主题曲",
		type: "video/mp4",
		title: "【4K_60FPS】人世间MV—雷佳《人世间》主题曲(2022)(AI_高清修复).31607557583",
		srcLocalhost: "./music/mv/雷佳 - 人世间.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《人世间》主题曲"
	},
	{
		id: "花间",
		type: "video/mp4",
		title: "《花间》 《忘了算了》",
		srcLocalhost: "./music/mv/花间.mp4",
		srcNetwork: null,
		poster: null,
		desc: "道济不负天下人，唯独负了胭脂，这就是我写《花间》和《忘了算了》的灵感。#徐嘉良 #活佛济公 #花间 #忘了算了#胭脂"
	},
	{
		id: "Haha Hihi Huhu Heheh",
		type: "video/mp4",
		title: "Haha Hihi Huhu Heheh",
		srcLocalhost: "./music/mv/Haha Hihi Huhu Heheh.mp4",
		srcNetwork: "https://v.douyin.com/fYq593dt7IE/",
		srcNetworkTwo: "https://v.douyin.com/NCoTVdjIvMw/",
		srcNetworkThree: "https://v.douyin.com/vQWSZ0190xk/",
		srcNetworkFour: "https://v.douyin.com/oGHPNXvoouA/",
		srcNetworkFive: "https://v.douyin.com/p3I5EVLIWqQ/",
		poster: null,
		desc: "帅气逼人组合Haha Hihi Huhu Heheh"
	},
	{
		id: "柳爽-漠河舞厅",
		type: "video/mp4",
		title: "【4K_60FPS】漠河舞厅MV—柳爽(致敬最爱的人逝去)(2020)(AI_高清修复).31936217997",
		srcLocalhost: "./music/mv/柳爽-漠河舞厅.mp4",
		srcNetwork: null,
		poster: null,
		desc: "需改MV 《漠河舞厅》MV—柳爽(致敬最爱的人逝去)(2020)(AI_高清修复).31936217997"
	},
	{
		id: "未知歌手 - 说谎 (DJ赵小涣)",
		type: "video/mp4",
		title: "【4K顶级现场】林宥嘉《说谎》神级现场",
		srcLocalhost: "./music/mv/林宥嘉 - 说谎.mp4",
		srcNetwork: null,
		poster: null,
		desc: "林宥嘉《说谎》神级现场!别以为你有多难忘,更何况那又不算伤!.906081558"
	},
	{
		id: "童话镇-陈一发儿",
		type: "video/mp4",
		title: "童话镇MV—陈一发儿",
		srcLocalhost: "./music/mv/童话镇-陈一发儿.mp4",
		srcNetwork: null,
		poster: null,
		desc: "童话镇MV—陈一发儿 #这么多年依然很喜欢童话镇 总有一条蜿蜒在童话镇里七彩的河 # 暗杠 # 童话镇 # 童话镇清唱 # 是臆想还是幻觉我分不清  https://v.douyin.com/LELkr1fhC_w/"
	},
	{
		id: "周杰伦-蒲公英的约定",
		type: "video/mp4",
		title: "蒲公英哪有什么约定 风一吹就散了 -周杰伦-蒲公英的约定",
		srcLocalhost: "./music/mv/周杰伦 - 蒲公英的约定.mp4",
		srcNetwork: null,
		poster: null,
		desc: "蒲公英哪有什么约定 风一吹就散了 -周杰伦-蒲公英的约定"
	},
	{
		id: "Salvatore",
		type: "video/mp4",
		title: "《Salvatore》#欧美音乐 #LanaDelRey 打雷姐",
		srcLocalhost: "./music/mv/Lana Del Rey - Salvatore.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《Salvatore》#欧美音乐 #LanaDelRey 打雷姐"
	},
	{
		id: "欢乐地跳吧",
		type: "video/mp4",
		title: "《欢乐地跳吧》舞蹈完整版来啦",
		srcLocalhost: "./music/mv/新疆美丽公主组合 - 欢乐地跳吧.mp4",
		srcLocalhostTwo: "./music/mv/欢乐的跳吧 如何叫醒一个新疆人.mp4",
		srcLocalhostThree: "./music/mv/维吾尔族大哥爆笑解释新疆舞动作.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《欢乐地跳吧》舞蹈 如何叫醒一个新疆人"
	},
	{
		id: "张杰-他不懂",
		type: "video/mp4",
		title: "[4K60FPS_Hi_Res] 张杰《他不懂》MV顶级修复",
		srcLocalhost: "./music/mv/张杰 - 他不懂.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS_Hi-Res】张杰《他不懂》MV顶级修复___歌的名字是他不懂,其实是我不懂"
	},
	{
		id: "毛不易-借",
		type: "video/mp4",
		title: "[4K60FPS_Hi_Res] 毛不易《借》MV全网最高画质修复",
		srcLocalhost: "./music/mv/毛不易-借.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS_Hi-Res】毛不易《借》MV全网最高音画质修复___被这风吹散的人说他爱的不深,被这雨淋湿的人说他不会冷"
	},
	{
		id: "毛不易-消愁",
		type: "video/mp4",
		title: "[4K60FPS_Hi_Res] 毛不易《消愁》动态歌词MV修复",
		srcLocalhost: "./music/mv/毛不易-消愁.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS_Hi-Res】毛不易《消愁》动态歌词MV修复___一杯敬我爹,一杯敬我娘,曾是他们的希望,如今活成这球样……"
	},
	{
		id: "苏打绿-我好想你",
		type: "video/mp4",
		title: "[4K60FPS_Hi_Res] 苏打绿《我好想你》顶级修复",
		srcLocalhost: "./music/mv/苏打绿-我好想你.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS_Hi-Res】苏打绿《我好想你》顶级修复___明明歌词是那么的苍白无力,可伴奏又能给人无限憧憬和美好!"
	},
	{
		id: "薛之谦-我好像在哪见过你",
		type: "video/mp4",
		title: "[4K60FPS_Hi_Res] 薛之谦《我好像在哪见过你》顶级修复",
		srcLocalhost: "./music/mv/薛之谦 - 我好像在哪见过你.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS_Hi-Res】薛之谦《我好像在哪见过你》___人们把难言的爱都埋进青春里!.29125510367"
	},
	{
		id: "薛之谦-木偶人",
		type: "video/mp4",
		title: "【4K60FPS_Hi-Res】薛之谦《木偶人》顶级修复___没有人能变成木偶人,无非是在感情里逃避过程_!!!.30497506817",
		srcLocalhost: "./music/mv/薛之谦-木偶人.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS_Hi-Res】薛之谦《木偶人》顶级修复___没有人能变成木偶人,无非是在感情里逃避过程_!!!.30497506817"
	},
	{
		id: "许飞-父亲写的散文诗",
		type: "video/mp4",
		title: "【4K60FPS_Hi-Res】许飞《父亲写的散文诗》___父亲是个农民,他没有散文诗,没有日记,只有一双布满老茧的手跟写满沧桑的脸庞!.32751423434",
		srcLocalhost: "./music/mv/许飞-父亲写的散文诗.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS_Hi-Res】许飞《父亲写的散文诗》___父亲是个农民,他没有散文诗,没有日记,只有一双布满老茧的手跟写满沧桑的脸庞!.32751423434"
	},
	{
		id: "恋人-李荣浩",
		type: "video/mp4",
		title: "《恋人》MV",
		srcLocalhost: "./music/mv/恋人-李荣浩.mp4",
		srcNetwork: null,
		poster: null,
		desc: "李荣浩⑧专5单《恋人》MV_现已正式上线.恋人mv正式上线.1602014297"
	},
	{
		id: "Despacito",
		type: "video/mp4",
		title: "汽车版Despacito",
		srcLocalhost: "./music/mv/汽车版Despacito.mp4",
		srcNetwork: null,
		poster: null,
		desc: "Despacito"
	},
	{
		id: "开始懂了-孙燕姿",
		type: "video/mp4",
		title: "【4K60FPS】孫燕姿《開始懂了》顶级音画质修复___爱情只有两个结局,要么一生,要么陌生!.27241349194",
		srcLocalhost: "./music/mv/孙燕姿 - 开始懂了.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K60FPS】孫燕姿《開始懂了》顶级音画质修复___爱情只有两个结局,要么一生,要么陌生!.27241349194"
	},
	{
		id: "远山少年",
		type: "video/mp4",
		title: "远山少年 已不在少 原有人陪你颠沛流离",
		srcLocalhost: "./music/mv/远山少年.mp4",
		srcNetwork: null,
		poster: null,
		desc: "远山少年 已不在少 原有人陪你颠沛流离"
	},
	{
		id: "小咪-我走后",
		type: "video/mp4",
		title: "小咪《我走后》完整版高清mv",
		srcLocalhost: "./music/mv/小咪-我走后.mp4",
		srcNetwork: null,
		poster: null,
		desc: "小咪《我走后》完整版高清mv #小咪我走后 #我走后完整版 - 抖音。《我走后》是一首由小咪创作和演唱的情歌，表达了一段过客的爱情和分离的心情。歌词中反复出现“我走后”这个词，表示对对方的不舍和祝福，收录在专辑《我走后》中。"
	},
	{
		id: "龙梅子、王强 - 你把爱情给了谁",
		srcNetwork: "https://www.douyin.com/video/7612282046111673467"
	},
	{
		id: "戴羽彤-来迟",
		type: "video/mp4",
		title: "戴羽彤-来迟_MV_4K_CD音质",
		srcLocalhost: "./music/mv/戴羽彤-来迟.mp4",
		srcNetwork: null,
		poster: posterLuYou + "戴羽彤-来迟_MV_4K_CD音质.jpeg",
		desc: "来迟是戴羽彤的一首歌曲，由卡文填词，三珊谱曲，筱明编曲，一寸光年团队制作。歌词表达了一种错过爱情的悲哀和后悔，反复唱出“我这一次终究还是来得太迟”。"
	},
	{
		id: "精忠报国-洪屠刚",
		type: "video/mp4",
		title: "【精忠报国】洪屠刚",
		srcLocalhost: "./music/mv/屠洪刚 - 精忠报国.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《精忠报国》"

	},
	{
		id: "张信哲 - 别怕我伤心",
		type: "video/mp4",
		title: "【4K修复】《别怕我伤心》张信哲_60FPS(高保真音质)",
		srcLocalhost: "./music/mv/张信哲 - 别怕我伤心.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《别怕我伤心》是由李宗盛作词并作曲，张信哲演唱的歌曲，收录于张信哲1994年6月1日发行的专辑《等待》中。"
	},
	{
		id: "精卫-30年前，50年后",
		type: "video/mp4",
		title: "精卫",
		srcLocalhost: "./music/mv/精卫-30年前，50年后.mp4",
		desc: "精卫，中国古代神话中的一种鸟。上古神话传说里，女娃是炎帝最小的女儿，后溺水而亡，化作精卫鸟；另一说，女娃是上古的一个部落，由于气候变暖，海平面上升，女娃部落遭到灭顶之灾，后化作精卫。\n据《山海经》记载：精卫的外形像乌鸦，头上羽毛有花纹，白色的嘴，红色的脚。 \n明代《律学新说》记载：精卫被民间尊为“三圣公主”。"
	},
	{
		id: "萧敬腾 - 怎么说我不爱你",
		type: "video/mp4",
		title: "萧敬腾《怎么说我不爱你》你怎么知道我不爱你,我就是太爱你了",
		srcLocalhost: "./music/mv/萧敬腾 - 怎么说我不爱你.mp4",
		srcNetwork: null,
		poster: null,
		desc: "【4K臻藏】萧敬腾《怎么说我不爱你》_你怎么知道我不爱你,我就是太爱你了!.1524443052"
	},
	{
		id: "胡彦斌-你要的全拿走",
		type: "video/mp4",
		title: "【胡彦斌】你要的全拿走",
		srcLocalhost: "./music/mv/胡彦斌-你要的全拿走.mp4",
		srcNetwork: null,
		poster: null,
		desc: "2018年胡彦斌演唱的歌曲。《你要的全拿走》是胡彦斌演唱的一首歌曲，由胡彦斌作词、作曲，谷粟编曲，收录在胡彦斌2018年1月23日发行的专辑《覅忒好》中 。"
	},
	{
		id: "周杰伦 - 说了再见",
		type: "video/mp4",
		title: "4K·重制周杰伦《说了再见》MV 修复版",
		srcLocalhost: "./music/mv/周杰伦 - 说了再见.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《说了再见》是周杰伦演唱的一首流行歌曲，收录于他2010年发行的专辑《跨时代》中。 这首歌由周杰伦作曲，古小力和黄凌嘉共同作词，钟兴民负责编曲。 这首歌也是李连杰主演的电影《海洋天堂》的主题曲。 这首歌的歌词描述了在雨中天亮后，主人公面对失去所爱之人的痛苦，试图放下过去，却发现再也无法与对方相见。 歌词中充满了对失去的微笑、幸福时光的怀念以及对再次拥抱和陪伴的渴望。"
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
		id: "老人与海 - 海鸣威",
		type: "video/mp4",
		title: "老人与海 - 海鸣威",
		srcLocalhost: "./music/mv/老人与海 - 海鸣威.mp4",
		srcNetwork: null,
		poster: null,
		desc: "这首歌的前奏永远听不腻_ #老人与海 #自由不需要理由 #喜爱度激励计划 #爱跳舞的小姑娘"
	},
	{
		id: "庾澄庆 - 春泥",
		type: "video/mp4",
		title: "春泥",
		srcLocalhost: "./music/mv/庾澄庆 - 春泥.mp4",
		srcNetwork: null,
		poster: null,
		desc: "《春泥》是由中国音乐人王鑫作词、作曲、编曲，王鑫是中国音乐行业的重要代表人物之一。该曲于2015年12月10日在中国音乐行业首次亮相，成为王鑫的代表作之一。"
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
		id: "李健 - 蝴蝶花 (Live)",
		type: "video/mp4",
		title: "李健-清华90年校庆合唱《蝴蝶花》《同桌的你》",
		srcLocalhost: "./music/mv/李健 - 蝴蝶花 (Live).mp4",
		srcNetwork: null,
		poster: "./music/audio/李健 - 蝴蝶花 (Live).png",
		desc: "清华大学 90 年校庆，李健与校友合唱《蝴蝶花》《同桌的你》"
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
		srcLocalhost: "./music/mv/说散就散-袁娅维TIA RAY.mp4",
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
		srcLocalhost: "./music/mv/林忆莲-至少还有你.mp4",
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
 * 「拉不动的 MV」看门狗计时器（模块级，切歌时由 updateVideo 清掉）。
 * 定义在函数外是因为 updateVideo 要能取消它，否则切走之后旧计时器还会去回退音频。
 */
let mvZeroBufTimer = null;

/**
 * 主函数
 * @param {object} musicInfo 音乐信息
 * @param {boolean} autoplay 是否自动播放
 * @returns {null} 无返回
 */
function audioMvmain(musicInfo = findMusic(title.textContent), autoplay = true) {
	if (!musicInfo || !musicInfo.srcLocalhost) return; // 无本地 MV 时直接跳过，避免 video.src = null
	let audioMvVideo1Element = window.audioMvVideo1;
	// isConnected 防御：面板被 updateVideo 清空后，window 上可能还残留已脱离文档的旧引用，
	// 复用这种元素会改了 src 却显示不出来，必须当不存在处理、重新创建
	if (audioMvVideo1Element && !audioMvVideo1Element.isConnected) {
		audioMvVideo1Element = null;
		window.audioMvVideo1 = null;
	}
	let video = null;
	let isNew = false;
	if (!audioMvVideo1Element) {
		// 创建一个video元素
		isNew = true;
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
		// 手机端必须内联播放：iOS 不加 playsinline 会强制全屏，部分安卓浏览器会直接拒绝播放
		video.playsInline = true;
		video.setAttribute('playsinline', '');
		video.setAttribute('webkit-playsinline', '');
		// 设置循环播放
		// video.loop = true;
		// 设置静音播放
		// video.muted = true;
		// 设置音量
		// video.volume = 0.5;
		// 预加载
		video.preload = "auto";
		// 控制条
		video.controls = true;
	} else {
		// 如果视频元素已经存在直接改属性就行了
		// ⚠️ 必须把局部 video 指向已存在元素：之前这里 video 保持 null，
		//    下面的 video.type = ... 会抛 TypeError 中断切歌流程，音乐也不播放（表现为卡住没反应）
		video = audioMvVideo1Element;
		audioMvVideo1Element.src = musicInfo.srcLocalhost;
	}
	// 视频封面
	if (isNew && musicInfo.poster) {
		video.poster = musicInfo.poster;
	}
	// musicInfo.poster ? video.poster = musicInfo.poster : void 0;
	// 视频类型（条目没写 type 时默认 mp4）
	video.type = musicInfo.type || "video/mp4";
	/**
	 * MV 正在加载：在歌词位置说明「MV 正在加载中…」。
	 * 线上有大到 80MB 以上的 MV，十几秒都起不来，这段时间既没画面也没声音；
	 * 没有任何提示的话，界面看着正常，完全判断不出是在加载还是坏了。
	 * autoplay=false 是页面初始化那一次，用户还没点播放，不该先摆一个加载提示。
	 * showLoading 内部有「本首已经出过声就不提示」的闸门，视频播放中拖进度条不会盖住歌词。
	 */
	if (autoplay) showLoading('mv');
	// 视频起不来时的音频兜底：只有「确实不能播放」才让音乐响。
	// 还在加载阶段（readyState 不够）不插音频——视频在转圈、音乐先响会很怪；
	// autoplay=false（页面初始化那次）也不插，否则一进页面就自动出声
	let mvFallbackUsed = false;
	function fallbackToAudio() {
		if (mvFallbackUsed) return;
		mvFallbackUsed = true;
		playSong();
	}
	/**
	 * 「拉不动」兜底：60 秒内 buffered 一直为 0（一个字节都没下到）→ 判定这个 MV 下不来，
	 * 回退音频，免得界面永远停在「MV 正在加载中…」，既没画面也没声音。
	 * 与「加载慢」区分：只要中途缓冲到过任何数据，看门狗立刻收工、之后一直等，再慢也不判死。
	 * 阈值 60 秒：线上实测冷启动差别很大——6MB 的《We Will Rock You》要 69 秒才起播，
	 * 86.9MB 的《浮夸》CDN 回源只有 19.6KB/s（下完要 74 分钟）。30 秒会把前者一起掐掉，
	 * 放宽到 60 秒；后者仍会被兜底（多等 30 秒，但至少能出声）。
	 * ⚠️ 已知局限：Chrome 在拿到可解码数据前 buffered 一直是 0，哪怕 CDN 正在传字节，
	 * 所以「buffered 为 0」不完全等于「一个字节都没下到」；moov 在文件尾的 mp4 尤其容易误判。
	 */
	const ZERO_BUF_LIMIT = 60000;
	function stopZeroBufWatch() {
		clearTimeout(mvZeroBufTimer);
		mvZeroBufTimer = null;
	}
	function startZeroBufWatch() {
		stopZeroBufWatch();
		const deadline = Date.now() + ZERO_BUF_LIMIT;
		const tick = function () {
			mvZeroBufTimer = null;
			if (!video.isConnected) return;                     // 已经切歌 / 被移除
			if (video.error || video.ended) return;             // 真出错（onerror 另有处理）/ 播完
			// ⚠️ 不能用 video.paused 判断「是否已起播」：调过 play() 之后 paused 立刻变 false，
			// 哪怕 readyState 还是 0、一个字节都没下来（实测就是这个假象让看门狗第一轮就退出了）。
			// 用 currentTime 是否在走作为「真的播起来了」的判据。
			if (video.currentTime > 0) return;
			// 有任何一段缓冲 = 数据在下来，只是慢：停止看门狗，后面不再干预
			if (video.buffered.length > 0 && video.buffered.end(video.buffered.length - 1) > 0) return;
			if (Date.now() >= deadline) {
				/**
				 * ⚠️ 必须先清掉 mvFallbackUsed：play() 一被调用就会派发 play 事件，
				 * 上面的 video.onplay 会立刻把它置成 true（它把「发了 play 事件」当成「已经播起来」）。
				 * 不清的话这里的 fallbackToAudio() 会直接 return，兜底等于没做。
				 * 另外注意 onplay 里不能调 stopZeroBufWatch()：没有数据的元素同样会派发 play 事件，
				 * 一停就再也等不到 60 秒了（第一版就是这么失效的）。
				 */
				mvFallbackUsed = false;
				fallbackToAudio();
				return;
			}
			mvZeroBufTimer = setTimeout(tick, 2000);
		};
		mvZeroBufTimer = setTimeout(tick, 4000);
	}
	// MV 文件不存在 / 解码失败：移除播放器，让音频顶上
	video.onerror = function () {
		// 已经被切歌清掉的旧 video：迟到的 error 不能去动全局引用，否则会把新 MV 的引用清空
		if (!this.isConnected) return;
		stopZeroBufWatch();
		this.remove();
		window.audioMvVideo1 = null;
		if (autoplay) {// 页面初始化那次（autoplay=false）不自动出声
			mvFallbackUsed = false;// 视频中途失败也算「不能播放」，允许音频顶上
			fallbackToAudio();
		}
	};
	/**
	 * ⚠️ 这里原来有一段「canplay 之后等 1 秒，视频还是 paused 就判定自动播放被浏览器拦截 →
	 * 回退音频」。实测证明这个判断是错的，而且是「视频都加载出来了，放的却是音频」的直接原因：
	 *   线上实测 25.181s 触发 canplay（readyState=3、有 0.3s 缓冲），同一时刻 video.paused 仍为 true
	 *   —— 因为 autoplay 属性根本没有触发播放（见下面 startMvPlayback 的说明）。
	 *   1.2 秒后这段定时器把「有数据但没播」当成「被浏览器拦了」，调用 fallbackToAudio() →
	 *   playSong()：音频起播的同时反过来把视频 pause 掉。视频就这么在马上要播的一刻被自己人判死。
	 * 那段里的 `typeof userPaused !== 'undefined'` 也是个从未生效的守卫：userPaused 这个变量
	 * 在全项目里没有定义，typeof 永远返回字符串 'undefined'，条件恒为 false。
	 * 现在只在「真的出错」时回退音频（见上面的 video.onerror），加载慢就一直等，
	 * 期间歌词位置显示「MV 正在加载中…」，不会静默变成音频。
	 */
	if (isNew) {
		audioMv.appendChild(video);
		/**
		 * 显式记下引用（audio.js 靠它判断「MV 是否正在播」，避免音频和视频同时出声）。
		 * 原来只靠 <video id="audioMvVideo1"> 自动挂到 window 的命名访问 —— 那种映射是
		 * 隐式且有条件的：只要某处执行过 window.audioMvVideo1 = null，就会生成一个覆盖它的
		 * 自有属性，之后即使再插入同 id 的元素也拿不到，引用就此永久失效。
		 */
		window.audioMvVideo1 = video;
	}
	/**
	 * 不能依赖 video.autoplay = true。上面的创建顺序是「先 src、再 autoplay、最后 appendChild」，
	 * 元素还没插入文档时设置 autoplay，这条自动播放请求会被丢掉，之后也不会补上 ——
	 * 线上实测 25 秒 canplay 那一刻 paused 仍是 true，就是它没生效的证明。
	 * 元素真正插入文档之后再显式调 play()，才会触发加载并开始播放。
	 *
	 * 出错分三种，处理方式不同：
	 * - AbortError：播放请求被下一次换源/加载打断。下一次播放会自动接上，静默忽略
	 *   （之前把它当失败、移除视频，导致 MV 全部消失）。
	 * - NotAllowedError：浏览器确实要求用户手势。退一步静音播放，再提示点一下开声音，
	 *   这样不会停在「什么都不动」的死状态。iOS 低电量模式、微信内置浏览器常见。
	 * - NotSupportedError 等：文件真的拿不到，交给 video.onerror 回退音频。
	 */
	function startMvPlayback() {
		if (!video.isConnected) return;
		const attempt = video.play();
		if (!attempt || typeof attempt.then !== 'function') return;
		attempt.catch(function (err) {
			const name = err && err.name;
			if (name === 'AbortError') return;
			if (name === 'NotAllowedError' && video.isConnected) {
				video.muted = true;
				const retry = video.play();
				if (retry && typeof retry.then === 'function') {
					retry.then(function () {
						if (video.isConnected) tanChuang('已静音播放，点击视频可开启声音', 3500);
					}).catch(function () {
						// 静音也被拒（极少数环境）：保留「MV 正在加载中…」，等用户点控制条
					});
				}
			}
		});
	}
	video.onplay = function () {
		/**
		 * 已经被 updateVideo 清掉的旧 video，它的 play 事件可能迟到。
		 * 不拦的话，这个迟到的 onplay 会执行下面的 pauseSong()，把刚刚切过去、已经开始播的
		 * 新歌停掉 —— 这正是「从 MV 切到没有 MV 的歌，再点一次播放才有效」的原因。
		 */
		if (!video.isConnected) return;
		mvFallbackUsed = true;// 视频真的播起来了，不需要音频兜底（下面会把音频停掉）
		// MV 播起来同样算「播放成功」，把音频那边的连续失败计数清掉，
		// 否则一路用 MV 听下去，计数只增不清，攒到 5 次就会莫名其妙整组停下
		errorCount = 0;
		// 本首已经出过声（声音由视频出）。标上之后，视频后续的缓冲不会再盖上「MV 正在加载中」，
		// 也不会把歌词顶掉。
		markSoundStarted();
		// MV 出声了：把「MV 正在加载中…」换回歌词
		restoreLrc();
		// 设置音乐进度为视频进度
		let savedTime = parseFloat(window.localStorage.getItem("musicTime")) || 0;
		if (savedTime > 0 && savedTime < video.duration) {
			video.currentTime = savedTime;
		}
		// 这里是「声音改由视频出」的内部暂停，不是用户按了暂停：
		// 传 false 避免把 playIntent 清成 false，否则从 MV 切回普通歌曲时会被当成用户不想听
		pauseSong(false);
		// 视频最大化
		if (video.requestFullscreen) {
			video.requestFullscreen();
		} else if (video.webkitRequestFullscreen) {
			video.webkitRequestFullscreen(); // 放在此位置能有效解决播放时视频全屏无法全屏的问题
		} else if (video.mozRequestFullScreen) {
			video.mozRequestFullScreen();
		} else if (video.msRequestFullscreen) {
			video.msRequestFullscreen();
		}
	};
	/**
	 * 视频缓冲（还没起播 / 加载中途）。
	 * 首次加载时把「MV 正在加载中…」重新摆出来；已经出过声的缓冲会被 showLoading 的闸门挡掉，
	 * 不会盖住歌词（否则播放中拖一次进度条，提示就永远挂在那儿了）。
	 */
	video.onwaiting = function () {
		if (!this.isConnected) return;
		if (autoplay) showLoading('mv');
	};
	video.onpause = function () {
		if (!this.isConnected) return;
		// 设置音乐进度为视频进度
		// window.localStorage.setItem("musicTime", video.currentTime); // 这里取消是因为在切换音乐的时候会影响到loaclstorage的修改
		// 只在真的处于全屏时才退出，部分手机浏览器非全屏状态调用会抛错
		if (document.fullscreenElement || document.webkitFullscreenElement) {
			document.webkitCancelFullScreen();
		}
		/**
		 * 用户主动按了暂停 → 记下「不想听了」，界面同步成暂停。
		 * 要排除两种不是用户意图的 pause：
		 * ① 播完（ended 为 true，onended 会去切下一首，不算暂停）；
		 * ② 我们为了改播音频而主动 pause 视频（audio.js 的 playSong 会置一个短暂时间窗）。
		 * 原来这个位置判断的是 `typeof userPaused !== 'undefined'`，而 userPaused 在全项目里
		 * 根本没有定义，typeof 恒返回字符串 'undefined'，那段守卫从未生效过。
		 */
		if (!video.ended && playIntent && Date.now() > suppressVideoPauseUntil) {
			playIntent = false;
			setPlayUI(false);
			setCoverSpin(false);
		}
	};
	video.onended = function () {
		lastChange === "prevSong" ? prevSong() : nextSong();
	};
	// 开始播放。两个分支都要走：新建的要播，复用元素改了 src 的也要播。
	// autoplay=false（页面初始化那次）只预加载、不出声。
	if (autoplay) startMvPlayback();
	// 同时开始「60 秒一个字节都没下到就回退音频」的看门狗（起播或缓冲到数据都会让它收工）
	if (autoplay) startZeroBufWatch();
	// 复用已存在的视频元素时，标题/描述/播放源按钮都还在面板里，直接返回，避免重复堆积
	if (!isNew) return;
	// 添加标题等表述元素
	// ⚠️ 不要命名为 title，会遮蔽全局的 title 元素（audio.js 依赖它）
	let mvTitle = document.createElement("h3");
	mvTitle.classList.add("audioMvTitle");
	mvTitle.textContent = musicInfo.title;
	let desc = document.createElement("p");
	desc.classList.add("audioMvDesc");

	// 直接使用传入的 musicInfo 参数，避免重复调用 findMusic 返回 undefined
	let playSourceList = [];
	if (musicInfo) {
		playSourceList = [
			{ src: musicInfo.srcLocalhost, name: "默认播放源" },
			{ src: musicInfo.srcLocalhostTwo, name: "本地播放源 2" },
			{ src: musicInfo.srcLocalhostThree, name: "本地播放源 3" },
			{ src: musicInfo.srcLocalhostFour, name: "本地播放源 4" },
			{ src: musicInfo.srcLocalhostFive, name: "本地播放源 5" },
			{ src: musicInfo.srcLocalhostSix, name: "本地播放源 6" },
			{ src: musicInfo.srcNetwork, name: "网络播放源" },
			{ src: musicInfo.srcNetworkTwo, name: "网络播放源 2" },
			{ src: musicInfo.srcNetworkThree, name: "网络播放源 3" },
			{ src: musicInfo.srcNetworkFour, name: "网络播放源 4" },
			{ src: musicInfo.srcNetworkFive, name: "网络播放源 5" },
			{ src: musicInfo.srcNetworkSix, name: "网络播放源 6" },
		];
	}

	let playSourceButtonList = [];
	for (let index = 0; index < playSourceList.length; index++) {
		if (!playSourceList[index].src) {
			continue;
		}
		let button = document.createElement("button");
		button.classList.add("switchSrc");
		button.textContent = playSourceList[index].name;
		button.onclick = function () {
			// 直接通过 DOM 查询获取视频元素，避免作用域问题
			const videoElement = document.querySelector("#audioMvVideo1");
			if (videoElement) {
				videoElement.src = playSourceList[index].src;
			} else {
				tanChuang("视频播放器未初始化");
			}
		};
		playSourceButtonList.push(button);
	}
	desc.textContent = musicInfo.desc;
	audioMv.appendChild(mvTitle);
	// 创建按钮容器，添加边距和间距
	let buttonContainer = document.createElement("div");
	buttonContainer.classList.add("playSourceButtonContainer");
	buttonContainer.style.cssText = "margin: 1rem 2rem; display: flex; flex-wrap: wrap; gap: 8px;";
	// 将所有播放源按钮添加到容器中
	playSourceButtonList.forEach(button => buttonContainer.appendChild(button));
	audioMv.appendChild(buttonContainer);
	audioMv.appendChild(desc);
}
// 更新video元素
function updateVideo() {
	let video = document.querySelector("#audioMvVideo1");
	if (!video) return;
	// 歌名里可能带 % 之类的字符，decodeURIComponent 会抛错并中断整个切歌回调
	// （回调一断，后面的播放/暂停判断全都不执行，表现为切歌后没反应）
	let srcDecoded = video.src;
	try {
		srcDecoded = decodeURIComponent(video.src);
	} catch (e) { }
	// 判断如果video.src包含title.textContent
	if (srcDecoded.includes(title.textContent)) {
		window.localStorage.setItem("musicTime", video.currentTime);
		return;
	}
	// 切到别的歌了：把 MV 面板清空。
	// 先 pause 让 onpause 把全屏退掉，再解绑所有会影响播放的回调：
	// 这个 video 马上要被移出文档，它迟到的 play/ended 事件会去暂停、切走刚刚开始播的新歌。
	try { video.pause(); } catch (e) { }
	// 切走了：取消「拉不动」看门狗，否则它到点还会去回退音频，把新歌停掉
	clearTimeout(mvZeroBufTimer);
	mvZeroBufTimer = null;
	video.onplay = null;
	video.oncanplay = null;
	video.onwaiting = null;
	video.onerror = null;
	video.onended = null;
	window.audioMvVideo1 = null;
	// 移除#audioMvPanel中的所有元素
	audioMv.textContent = "";
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