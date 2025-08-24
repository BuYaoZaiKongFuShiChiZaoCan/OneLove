const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const path = require('path');

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OneLove API is running',
    timestamp: new Date().toISOString()
  });
});

// 认证相关端点
app.post('/api/auth/login', (req, res) => {
  // 临时登录逻辑
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin'
        },
        token: 'temp_token_' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }
});

// 时间线数据端点
app.get('/api/timeline-data/:type', (req, res) => {
  const { type } = req.params;
  
  // 返回模拟数据
  const mockData = {
    myPast: [
      {
        id: '1',
        title: '项目启动',
        date: '2024-01-01',
        description: 'OneLove项目正式启动'
      }
    ],
    health: [
      {
        id: '1',
        title: '健康记录',
        date: '2024-01-01',
        description: '保持健康的生活方式'
      }
    ]
  };
  
  res.json({
    success: true,
    data: mockData[type] || []
  });
});

// 更新日志端点
app.get('/api/changelog', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        version: '1.0.0',
        date: '2024-01-01',
        changes: ['初始版本发布']
      }
    ]
  });
});

// 用户信息端点
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && token.startsWith('temp_token_')) {
    res.json({
      success: true,
      data: {
        user: {
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '未授权'
    });
  }
});

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
    message: '服务器内部错误'
  });
});

module.exports.handler = serverless(app);

