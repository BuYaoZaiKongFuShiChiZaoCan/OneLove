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

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OneLove API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 测试端点
app.post('/api/test', (req, res) => {
  console.log('=== 测试端点 ===');
  console.log('请求体:', req.body);
  console.log('请求头:', req.headers);
  
  res.json({
    success: true,
    message: '测试端点正常工作',
    receivedData: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// 认证相关端点
app.post('/api/auth/login', (req, res) => {
  console.log('=== 登录请求开始 ===');
  console.log('请求体:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  
  // 临时登录逻辑
  const { username, password } = req.body;
  
  console.log('解析的用户名:', username);
  console.log('解析的密码:', password);
  
  // 测试账户列表
  const testAccounts = {
    'admin': { password: 'admin123', email: 'admin@example.com', role: 'admin' },
    'user': { password: 'user123', email: 'user@example.com', role: 'user' },
    'developer': { password: 'dev123', email: 'dev@example.com', role: 'developer' },
    'test': { password: 'test123', email: 'test@example.com', role: 'user' },
    'guest': { password: 'guest123', email: 'guest@example.com', role: 'guest' }
  };
  
  console.log('期望的用户名列表:', Object.keys(testAccounts));
  
  if (testAccounts[username] && testAccounts[username].password === password) {
    console.log('登录验证成功');
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          username: username,
          email: testAccounts[username].email,
          role: testAccounts[username].role
        },
        token: 'temp_token_' + Date.now() + '_' + username
      }
    });
  } else {
    console.log('登录验证失败');
    console.log('用户名存在:', !!testAccounts[username]);
    if (testAccounts[username]) {
      console.log('密码匹配:', testAccounts[username].password === password);
    }
    res.status(401).json({
      success: false,
      message: '用户名或密码错误',
      debug: {
        receivedUsername: username,
        receivedPassword: password ? '***' : 'undefined',
        availableAccounts: Object.keys(testAccounts),
        hint: '可用的测试账户: admin/admin123, user/user123, developer/dev123, test/test123, guest/guest123'
      }
    });
  }
});

// 用户注册端点
app.post('/api/auth/register', (req, res) => {
  console.log('=== 注册请求开始 ===');
  console.log('请求体:', req.body);
  
  const { username, email, password, confirmPassword } = req.body;
  
  // 基本验证
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: '请填写所有必填字段'
    });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: '两次输入的密码不一致'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: '密码长度至少6位'
    });
  }
  
  // 检查用户名是否已存在（模拟）
  const existingUsers = ['admin', 'user', 'developer', 'test', 'guest'];
  if (existingUsers.includes(username)) {
    return res.status(400).json({
      success: false,
      message: '用户名已存在'
    });
  }
  
  // 模拟注册成功
  console.log('注册成功:', { username, email });
  res.json({
    success: true,
    message: '注册成功！请使用新账户登录',
    data: {
      user: {
        username: username,
        email: email,
        role: 'user'
      }
    }
  });
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
    // 从token中提取用户名
    const tokenParts = token.split('_');
    const username = tokenParts[tokenParts.length - 1];
    
    // 测试账户列表
    const testAccounts = {
      'admin': { email: 'admin@example.com', role: 'admin' },
      'user': { email: 'user@example.com', role: 'user' },
      'developer': { email: 'dev@example.com', role: 'developer' },
      'test': { email: 'test@example.com', role: 'user' },
      'guest': { email: 'guest@example.com', role: 'guest' }
    };
    
    if (testAccounts[username]) {
      res.json({
        success: true,
        data: {
          user: {
            username: username,
            email: testAccounts[username].email,
            role: testAccounts[username].role
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: '无效的token'
      });
    }
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
    message: '服务器内部错误',
    error: err.message
  });
});

module.exports.handler = serverless(app);

