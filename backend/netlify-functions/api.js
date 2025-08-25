// OneLove API Functions - 连接到真实后端
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'OneLove_JWT_Secret_2024_Production_Key_For_Security';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/onelove?retryWrites=true&w=majority&appName=OneLove';

console.log('🔧 API初始化 - 环境变量检查:');
console.log('JWT_SECRET:', JWT_SECRET ? '已设置' : '使用默认值');
console.log('MONGODB_URI:', MONGODB_URI ? '已设置' : '未设置');

// 用户模型
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'developer', 'guest'] },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// 密码比较方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Changelog模型（与本地后端一致）
const changelogItemSchema = new mongoose.Schema({
  itemTime: { type: String, default: '' },
  itemContent: { type: String, required: true }
});

const changelogSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 },
  time: { type: String, default: '' },
  content: { type: [changelogItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Changelog = mongoose.models.Changelog || mongoose.model('Changelog', changelogSchema);

// Timeline数据模型
const timelineDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true, enum: ['myPast', 'health', 'work', 'study'] },
  data: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

const TimelineData = mongoose.models.TimelineData || mongoose.model('TimelineData', timelineDataSchema);

// 连接数据库
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ 数据库已连接');
      return true;
    }
    
    console.log('🔗 正在连接数据库...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB 连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

// JWT验证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '访问令牌缺失' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: '无效的访问令牌' });
  }
};

// 健康检查
app.get('/api/health', async (req, res) => {
  console.log('🏥 健康检查请求');
  const dbConnected = await connectDB();
  res.json({
    status: 'ok',
    message: 'OneLove API is running in production mode (Netlify Functions)',
    timestamp: new Date().toISOString(),
    environment: 'netlify-functions',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// 用户角色检查
app.get('/api/test/user', authenticateToken, async (req, res) => {
  console.log('👤 用户角色检查请求');
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      return res.status(500).json({ success: false, message: '数据库连接失败' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ 用户角色检查错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取当前登录用户信息
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  console.log('🔎 获取当前用户信息 /api/auth/me');
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      return res.status(500).json({ success: false, message: '数据库连接失败' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('❌ /api/auth/me 错误:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取Changelog
app.get('/api/changelog', async (req, res) => {
  console.log('📝 获取Changelog请求');
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      return res.status(500).json({ success: false, message: '数据库连接失败' });
    }

    const limit = parseInt(req.query.limit) || 100;
    const changelogs = await Changelog.find()
      .sort({ order: -1, updatedAt: -1 })
      .limit(limit);

    const formattedChangelogs = changelogs.map(cl => ({
      _id: cl._id,
      version: cl.version,
      order: typeof cl.order === 'number' ? cl.order : 0,
      time: cl.time || '',
      content: Array.isArray(cl.content) ? cl.content : [],
      createdAt: cl.createdAt,
      updatedAt: cl.updatedAt
    }));

    res.json({
      success: true,
      data: { changelogs: formattedChangelogs },
      message: '获取Changelog成功'
    });
  } catch (error) {
    console.error('❌ 获取Changelog错误:', error);
    res.status(500).json({ success: false, message: '获取Changelog失败' });
  }
});

// 获取Timeline数据
app.get('/api/timeline-data/:type', authenticateToken, async (req, res) => {
  const { type } = req.params;
  
  console.log(`📊 获取Timeline数据请求 - 类型: ${type}`);
  
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) {
      return res.status(500).json({ success: false, message: '数据库连接失败' });
    }

    const timelineData = await TimelineData.findOne({
      userId: req.user.userId,
      type: type
    }).sort({ timestamp: -1 });

    if (!timelineData) {
      return res.json({
        success: true,
        data: [],
        message: `未找到${type}类型的数据`,
        isEmpty: true
      });
    }

    res.json({
      success: true,
      data: Array.isArray(timelineData.data) ? timelineData.data : [],
      timestamp: timelineData.timestamp
    });
  } catch (error) {
    console.error(`❌ 获取${type}数据错误:`, error);
    res.status(500).json({ success: false, message: `获取${type}数据失败` });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 登录请求开始');
  
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码都是必需的'
      });
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
      return res.status(500).json({
        success: false,
        message: '数据库连接失败，请稍后重试'
      });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: '登录成功！',
      data: {
        user: { 
          id: user._id,
          username: user.username, 
          email: user.email, 
          role: user.role 
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ 登录错误:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

module.exports.handler = serverless(app);
