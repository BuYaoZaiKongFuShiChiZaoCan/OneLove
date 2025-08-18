const serverless = require('serverless-http');
const express = require('express');
const app = require('../../OneLove-backend/app');

// 包装一层，确保在 Netlify Functions 路径前缀下路由匹配
const server = express();

// 调整请求路径，将 Netlify Functions 前缀还原为应用路由前缀
server.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  next();
});

server.use(app);

module.exports.handler = serverless(server);

