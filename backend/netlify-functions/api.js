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

// 连接数据库
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ 数据库已连接');
      return true; // 已经连接
    }
    
    console.log('🔗 正在连接数据库...');
    console.log('连接字符串:', MONGODB_URI.substring(0, 50) + '...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB 连接成功');
    console.log('数据库名称:', mongoose.connection.db.databaseName);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
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
    database: dbConnected ? 'connected' : 'disconnected',
    database_name: mongoose.connection.db?.databaseName || 'unknown',
    env_vars: {
      has_jwt_secret: !!process.env.JWT_SECRET,
      has_mongodb_uri: !!process.env.MONGODB_URI
    }
  });
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 登录请求开始');
  console.log('请求体:', JSON.stringify(req.body));
  
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      console.log('❌ 缺少用户名或密码');
      return res.status(400).json({
        success: false,
        message: '用户名和密码都是必需的'
      });
    }

    console.log(`🔍 尝试登录用户: ${username}`);

    // 连接数据库
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.log('❌ 数据库连接失败');
      return res.status(500).json({
        success: false,
        message: '数据库连接失败，请稍后重试'
      });
    }

    // 查找用户（支持用户名或邮箱登录）
    console.log('🔍 在数据库中查找用户...');
    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });
    
    if (!user) {
      console.log('❌ 用户不存在:', username);
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    if (!user.isActive) {
      console.log('❌ 用户已被禁用:', username);
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    console.log(`✅ 找到用户: ${user.username} (${user.email})`);

    // 验证密码
    console.log('🔐 验证密码...');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ 密码验证失败');
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    console.log('✅ 密码验证成功');

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ 登录成功，返回用户数据');

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
