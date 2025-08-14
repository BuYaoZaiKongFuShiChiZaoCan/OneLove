// About页面配置文件
const config = {
	// 开发环境
	development: {
		apiBaseUrl: 'http://localhost:3000/api',
	},

	// 生产环境
	production: {
		apiBaseUrl: 'https://your-railway-app.railway.app/api', // 使用HTTPS后端服务
	}
};

// 根据当前环境获取配置
const getConfig = () => {
	const isDevelopment = window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1';

	return isDevelopment ? config.development : config.production;
};

// 导出配置
window.AboutConfig = getConfig(); 