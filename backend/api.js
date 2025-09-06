// Netlify Functions 入口点
// 直接导出合并后的server.js的handler
module.exports = require('./server.js').handler;
