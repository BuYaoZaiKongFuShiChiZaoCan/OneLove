// OneLove API Functions - 简化生产版本
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'OneLove_JWT_Secret_2024_Production_Key_For_Security';

// 模拟数据库
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O',
    role: 'admin'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O',
    role: 'user'
  }
];

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OneLove API is running in production mode',
    timestamp: new Date().toISOString()
  });
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: { username: user.username, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (!username || !email || !password || password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: '请填写所有字段且密码一致'
      });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      role: 'user'
    };

    users.push(newUser);

    res.json({
      success: true,
      message: '注册成功！',
      data: { user: { username, email, role: 'user' } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '注册失败' });
  }
});

// 获取用户信息
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      data: { user: { username: user.username, email: user.email, role: user.role } }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: '无效令牌' });
  }
});

// 时间线数据
app.get('/api/timeline-data/:type', (req, res) => {
  const mockData = {
    myPast: [
      { id: '1', title: '项目启动', date: '2024-01-01', description: 'OneLove项目正式启动' }
    ],
    health: [
      { id: '1', title: '健康记录', date: '2024-01-01', description: '保持健康的生活方式' }
    ]
  };
  
  res.json({ success: true, data: mockData[req.params.type] || [] });
});

// 更新日志
app.get('/api/changelog', (req, res) => {
  res.json({
    success: true,
    data: [{ version: '1.0.0', date: '2024-08-24', changes: ['初始版本发布'] }]
  });
});

module.exports.handler = serverless(app);
