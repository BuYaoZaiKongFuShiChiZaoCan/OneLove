// OneLove API Functions - 生产环境版本
// 使用真实的后端服务器和数据库
// 更新时间: 2024-08-24

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入真实的后端应用
const backendApp = require('../../OneLove-backend/app');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OneLove API is running in production mode',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

// 将所有API请求转发到真实的后端
app.use('/api', backendApp);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

module.exports.handler = serverless(app);

