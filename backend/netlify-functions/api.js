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

// 角色校验中间件
function requireDeveloperOrAdmin(req, res, next) {
  const role = req.user?.role;
  if (role === 'developer' || role === 'admin') return next();
  return res.status(403).json({ success: false, message: '需要开发者或管理员权限' });
}

function requireAdmin(req, res, next) {
  const role = req.user?.role;
  if (role === 'admin') return next();
  return res.status(403).json({ success: false, message: '需要管理员权限' });
}

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
        // 兼容旧字段
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        // 前端期望的新结构
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
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

// ========== Changelog 写接口 ==========
// 创建changelog
app.post('/api/changelog', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const { version, order = 0, time = '', content = [] } = req.body || {};
    if (!version) return res.status(400).json({ success: false, message: 'version 必填' });

    const created = await Changelog.create({ version, order, time, content: Array.isArray(content) ? content : [] });
    return res.json({ success: true, data: created });
  } catch (error) {
    console.error('❌ 创建changelog失败:', error);
    return res.status(500).json({ success: false, message: '创建失败' });
  }
});

// 添加子项
app.post('/api/changelog/:id/items', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const { id } = req.params;
    const { itemTime = '', itemContent = '' } = req.body || {};
    if (!itemContent) return res.status(400).json({ success: false, message: 'itemContent 必填' });

    const doc = await Changelog.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: '版本不存在' });

    doc.content = Array.isArray(doc.content) ? doc.content : [];
    doc.content.push({ itemTime, itemContent });
    doc.updatedAt = new Date();
    await doc.save();

    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('❌ 添加changelog子项失败:', error);
    return res.status(500).json({ success: false, message: '添加失败' });
  }
});

// 删除子项
app.delete('/api/changelog/:id/items/:index', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const { id, index } = req.params;
    const idx = Number(index);

    const doc = await Changelog.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: '版本不存在' });

    doc.content = Array.isArray(doc.content) ? doc.content : [];
    if (idx < 0 || idx >= doc.content.length) {
      return res.status(400).json({ success: false, message: '索引无效' });
    }
    doc.content.splice(idx, 1);
    doc.updatedAt = new Date();
    await doc.save();

    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('❌ 删除changelog子项失败:', error);
    return res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ========== Auth 扩展 ==========
const SALT_ROUNDS = 10;

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const { username, email, password, role = 'user' } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ success: false, message: '必填项缺失' });

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ success: false, message: '用户名或邮箱已存在' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await User.create({ username, email, password: hashed, role });

    return res.json({ success: true, data: { id: created._id, username, email, role: created.role } });
  } catch (error) {
    console.error('❌ 注册失败:', error);
    return res.status(500).json({ success: false, message: '注册失败' });
  }
});

// 登出（前端删除token即可，这里返回成功）
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: '已登出' });
});

// 更新个人资料
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const { username, email } = req.body || {};
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    const updated = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    return res.json({ success: true, data: { id: updated._id, username: updated.username, email: updated.email, role: updated.role } });
  } catch (error) {
    console.error('❌ 更新资料失败:', error);
    return res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 修改密码
app.put('/api/auth/password', authenticateToken, async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: '缺少旧/新密码' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    const ok = await user.comparePassword(oldPassword);
    if (!ok) return res.status(401).json({ success: false, message: '旧密码不正确' });

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return res.json({ success: true, message: '密码已更新' });
  } catch (error) {
    console.error('❌ 修改密码失败:', error);
    return res.status(500).json({ success: false, message: '修改失败' });
  }
});

// 忘记密码（占位实现）
app.post('/api/auth/forgot-password', async (req, res) => {
  return res.json({ success: true, message: '如果邮箱存在，将发送重置说明（占位）' });
});

// 重置密码（占位实现）
app.post('/api/auth/reset-password', async (req, res) => {
  return res.json({ success: true, message: '密码已重置（占位）' });
});

// ========== Users 基本接口 ==========
// 列表
app.get('/api/users', async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const users = await User.find({}, { username: 1, email: 1, role: 1, isActive: 1, createdAt: 1 });
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error);
    return res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 详情
app.get('/api/users/:id', async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const user = await User.findById(req.params.id, { username: 1, email: 1, role: 1, isActive: 1, createdAt: 1 });
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('❌ 获取用户详情失败:', error);
    return res.status(500).json({ success: false, message: '获取失败' });
  }
});

// ========== UserData 统计（占位实现，避免404） ==========
app.get('/api/userdata/stats', authenticateToken, async (req, res) => {
  try {
    const dbConnected = await connectDB();
    if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

    // 占位统计，后续可接入真实 passwords/phones/backups 集合
    const stats = {
      passwords: 0,
      phones: 0,
      backups: 0,
      accessLogs: 0,
      lastLogin: user.lastLogin || null
    };

    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ 获取用户数据统计失败:', error);
    return res.status(500).json({ success: false, message: '统计失败' });
  }
});

// ========== UserData 密码/手机 CRUD 与查询（占位实现） ==========
// 密码列表
app.get('/api/userdata/passwords', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 密码查询
app.get('/api/userdata/passwords/query', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 新增密码
app.post('/api/userdata/passwords', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: { id: 'placeholder', ...req.body } });
});
// 更新密码
app.put('/api/userdata/passwords/:id', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: { id: req.params.id, ...req.body } });
});
// 删除密码
app.delete('/api/userdata/passwords/:id', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'deleted' });
});
// 通过分类名删除密码
app.delete('/api/userdata/passwords/category/:category', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'deleted by category', category: req.params.category });
});

// 手机列表
app.get('/api/userdata/phones', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 新增手机
app.post('/api/userdata/phones', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: { id: 'placeholder', ...req.body } });
});
// 更新手机
app.put('/api/userdata/phones/:id', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: { id: req.params.id, ...req.body } });
});
// 删除手机
app.delete('/api/userdata/phones/:id', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'deleted' });
});

// ========== Admin 管理端（占位实现，需更细权限时可切换为 requireAdmin） ==========
// 管理用户列表
app.get('/api/admin/users', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 管理查看全部密码
app.get('/api/admin/passwords', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 管理查看全部手机
app.get('/api/admin/phones', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 管理删除任意密码
app.delete('/api/admin/passwords/:id', authenticateToken, requireAdmin, async (req, res) => {
  return res.json({ success: true, message: 'admin deleted password', id: req.params.id });
});
// 管理删除任意手机
app.delete('/api/admin/phones/:id', authenticateToken, requireAdmin, async (req, res) => {
  return res.json({ success: true, message: 'admin deleted phone', id: req.params.id });
});
// 管理更新用户角色
app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  return res.json({ success: true, message: 'role updated (placeholder)', id: req.params.id, role: req.body?.role || 'user' });
});
// 管理禁用/启用用户
app.put('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  return res.json({ success: true, message: 'status updated (placeholder)', id: req.params.id, isActive: !!req.body?.isActive });
});

// ========== 数据迁移/导出导入/备份恢复/访问日志（占位实现） ==========
// 迁移密码
app.post('/api/migrate/passwords', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'passwords migrated (placeholder)' });
});
// 迁移手机
app.post('/api/migrate/phones', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'phones migrated (placeholder)' });
});
// 导出用户数据
app.get('/api/userdata/export', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: { passwords: [], phones: [] } });
});
// 导入用户数据
app.post('/api/userdata/import', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'imported (placeholder)' });
});
// 备份历史
app.get('/api/userdata/backups', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 创建备份
app.post('/api/userdata/backup', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'backup created (placeholder)', id: 'backup-id' });
});
// 备份详情
app.get('/api/userdata/backup/:backupId', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: { id: req.params.backupId, items: [] } });
});
// 恢复备份
app.post('/api/userdata/restore/:backupId', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'restored (placeholder)', id: req.params.backupId });
});
// 删除备份
app.delete('/api/userdata/backup/:backupId', authenticateToken, async (req, res) => {
  return res.json({ success: true, message: 'backup deleted (placeholder)', id: req.params.backupId });
});
// 访问日志
app.get('/api/userdata/access-logs', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: [] });
});
// 访问统计
app.get('/api/userdata/access-stats', authenticateToken, async (req, res) => {
  return res.json({ success: true, data: { total: 0 } });
});

module.exports.handler = serverless(app);
