// Netlify Functions 入口点
// 必须以 named export 方式导出 handler
module.exports.handler = require('../server.js').handler;
