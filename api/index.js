// OneLove API 服务器 - Vercel部署版本
// 这个文件是Vercel服务器函数的入口点

// 导入后端服务器
const server = require('../OneLove-backend/server.js');
 
// 导出Vercel函数处理器
module.exports = server; 