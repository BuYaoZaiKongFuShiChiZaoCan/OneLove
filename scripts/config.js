// OneLove 项目配置文件
const config = {
	// 开发环境
	development: {
		apiBaseUrl: 'http://localhost:3000/api',
		corsOrigin: 'http://localhost:3000'
	},

	// 生产环境 - Netlify
	production: {
		// 注意：您需要部署后端到Railway或其他平台，然后更新这个URL
		// 当前使用本地开发服务器作为临时解决方案
		apiBaseUrl: 'http://localhost:3000/api', // 临时使用本地服务器
		// apiBaseUrl: 'https://your-railway-app.railway.app/api', // 部署后使用这个
		corsOrigin: 'https://yibiling.netlify.app'
	}
};

// 根据当前环境获取配置
const getConfig = () => {
	const isDevelopment = window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1';

	// 如果是生产环境但后端未部署，显示提示
	if (!isDevelopment) {
		console.warn('⚠️ 生产环境检测到，但后端API可能未正确配置。');
		console.warn('请确保后端服务器正在运行，或部署到Railway等平台。');
	}

	return isDevelopment ? config.development : config.production;
};

// 导出配置
window.OneLoveConfig = getConfig(); 