// OneLove 项目配置文件
const config = {
  // 开发环境
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    corsOrigin: 'http://localhost:3000'
  },
  
  // 生产环境 - Netlify
  production: {
    apiBaseUrl: 'http://localhost:3000/api', // 暂时使用本地后端，避免CORS问题
    corsOrigin: 'https://yibiling.netlify.app'
  }
};

// 根据当前环境获取配置
const getConfig = () => {
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  return isDevelopment ? config.development : config.production;
};

// 导出配置
window.OneLoveConfig = getConfig(); 