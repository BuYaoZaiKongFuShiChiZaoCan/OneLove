// ========================================
// OneLove 后端服务器 - 完整版本
// ========================================

// 导入必要的模块
const express = require('express');        // Express框架 - 用于创建Web服务器
const cors = require('cors');              // CORS中间件 - 处理跨域请求
const serverless = require('serverless-http'); // Netlify Functions支持

const morgan = require('morgan');          // 日志中间件 - 记录请求日志
const path = require('path');              // 路径模块 - 处理文件路径
const mongoose = require('mongoose');      // 导入mongoose
const bcrypt = require('bcryptjs');        // 密码加密
const jwt = require('jsonwebtoken');       // JWT令牌
const fs = require('fs');                  // 文件系统模块

// 优先加载环境变量，确保后续读取到正确的配置（例如 JWT_SECRET）
const envPath = path.join(__dirname, 'config.env');
require('dotenv').config({ path: envPath });

// 读取package.json获取版本号（在无服务器环境中可能不存在，需容错）
let APP_VERSION = 'dev';
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    APP_VERSION = packageJson.version || APP_VERSION;
  }
} catch (_) {
  // 忽略读取失败，使用默认版本
}

// 导入中间件
const { requireAdmin } = require('./middleware/auth');
const { loggerMiddleware, securityAudit, logAccess } = require('./middleware/logger');

// 定义开发者或管理员权限中间件
const requireDeveloperOrAdmin = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: '需要登录'
			});
		}

		if (req.user.role !== 'developer' && req.user.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: '需要开发者或管理员权限'
			});
		}

		next();
	} catch (error) {
		res.status(500).json({
			success: false,
			message: '权限验证失败'
		});
	}
};

// 导入数据模型
const User = require('./models/User');
const Changelog = require('./models/Changelog');
// 避免重复定义 TimelineData
let TimelineData;
if (mongoose.models.TimelineData) {
    TimelineData = mongoose.models.TimelineData;
} else {
    TimelineData = require('./models/TimelineData');
}
// Password和Phone模型在下方定义

// 创建Express应用实例
const app = express();

// 设置端口号
const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 2457 : 3000);

// JWT密钥（生产必须从环境变量提供；本地/临时环境随机生成以避免将密钥写入仓库）
const crypto = require('crypto');
const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? '' : crypto.randomBytes(32).toString('hex'));


// ========================================
// 连接数据库
// ========================================
const connectDB = require('./config/database');

// ========================================
// 数据模型
// ========================================

// 用户数据模型
const userDataSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	dataType: {
		type: String,
		enum: ['password', 'phone', 'note', 'changelog'],
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	content: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	description: {
		type: String,
		trim: true
	},
	status: {
		type: String,
		enum: ['active', 'inactive', 'archived'],
		default: 'active'
	},
	tags: [{
		type: String,
		trim: true
	}],
	priority: {
		type: String,
		enum: ['low', 'medium', 'high'],
		default: 'medium'
	},
	isEncrypted: {
		type: Boolean,
		default: false
	},
	accessLevel: {
		type: String,
		enum: ['private', 'shared', 'public'],
		default: 'private'
	}
}, {
	timestamps: true
});

// 创建模型
const UserData = mongoose.model('UserData', userDataSchema);

// ========================================
// 数据模型
// ========================================

// 导入加密工具
const Encryption = require('./utils/encryption');

// 密码数据模型
const passwordSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	category: {
		type: String,
		required: true
	},
	data: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// 加密相关字段
	isEncrypted: {
		type: Boolean,
		default: false
	},
	encryptionIv: {
		type: String,
		default: null
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// 保存前加密数据
passwordSchema.pre('save', function (next) {
	if (this.isModified('data') && !this.isEncrypted) {
		const encrypted = Encryption.encryptObject(this.data);
		if (encrypted) {
			this.data = encrypted.encrypted;
			this.encryptionIv = encrypted.iv;
			this.isEncrypted = true;
		}
	}
	next();
});

// 查询后解密数据
passwordSchema.post('find', function (docs) {
	if (docs && Array.isArray(docs)) {
		docs.forEach(doc => {
			if (doc.isEncrypted && doc.encryptionIv) {
				const decrypted = Encryption.decryptObject(doc.data, doc.encryptionIv);
				if (decrypted) {
					doc.data = decrypted;
				}
			}
		});
	}
});

passwordSchema.post('findOne', function (doc) {
	if (doc && doc.isEncrypted && doc.encryptionIv) {
		const decrypted = Encryption.decryptObject(doc.data, doc.encryptionIv);
		if (decrypted) {
			doc.data = decrypted;
		}
	}
});

// 手机数据模型
const phoneSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	data: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

const Password = mongoose.model('Password', passwordSchema);
const Phone = mongoose.model('Phone', phoneSchema);

// ========================================
// 中间件配置
// ========================================

// 完全禁用Helmet中间件以解决CSP问题
// app.use(helmet());

// CORS中间件 - 允许前端访问API
app.use(cors({
	origin: [
		'http://localhost:3000',
		'http://127.0.0.1:3000',
		'http://localhost:5500',
		'https://onelove-app.vercel.app',
		'https://onelove-app-git-main.vercel.app',
		'https://onelove-app-git-develop.vercel.app',
		'https://yibiling.netlify.app',
		'https://your-railway-app.railway.app', // Placeholder for Railway backend
		process.env.CORS_ORIGIN
	].filter(Boolean),
	credentials: true
}));

// 日志中间件 - 记录所有HTTP请求
app.use(morgan('combined'));

// JSON解析中间件 - 解析请求体中的JSON数据
app.use(express.json());

// URL编码解析中间件 - 解析表单数据
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供静态资源（如HTML、CSS、JS文件）
app.use(express.static(path.join(__dirname, 'public')));
// 根目录静态文件服务 - 提供根目录下的HTML文件
app.use(express.static(path.join(__dirname, '..')));
app.use('/Pages', express.static(path.join(__dirname, '../Pages')));
app.use('/styles', express.static(path.join(__dirname, '../styles')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/music', express.static(path.join(__dirname, '../music')));
app.use('/font', express.static(path.join(__dirname, '../font')));
app.use('/webfonts', express.static(path.join(__dirname, '../webfonts')));
app.use('/scripts', express.static(path.join(__dirname, '../scripts')));
app.use('/time', express.static(path.join(__dirname, '../time')));
app.use('/biJi', express.static(path.join(__dirname, '../biJi')));

// 添加额外的静态文件路径以处理子目录
app.use('/music/lrc', express.static(path.join(__dirname, '../music/lrc')));
app.use('/music/audio', express.static(path.join(__dirname, '../music/audio')));
app.use('/images/time', express.static(path.join(__dirname, '../images/time')));
app.use('/images/footer', express.static(path.join(__dirname, '../images/footer')));
app.use('/scripts/typed/node_modules/typed.js/dist', express.static(path.join(__dirname, '../scripts/typed/node_modules/typed.js/dist')));

// ========================================
// 认证中间件
// ========================================
const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) {
			return res.status(401).json({
				success: false,
				message: '访问令牌缺失，请先登录'
			});
		}

		const decoded = jwt.verify(token, JWT_SECRET);

		// 如果数据库未连接，降级到基于令牌的用户信息
		if (mongoose.connection.readyState !== 1) {
			req.user = {
				_id: decoded.userId || 'mock-user-id',
				role: decoded.role || 'developer',
				username: decoded.username || 'mock-user',
				email: decoded.email || 'mock@example.com',
				isActive: true
			};
			return next();
		}

		const user = await User.findById(decoded.userId).select('-password');
		if (!user || !user.isActive) {
			return res.status(401).json({
				success: false,
				message: '用户不存在或账户已被禁用'
			});
		}

		req.user = user;
		next();
  } catch (error) {
		return res.status(401).json({
			success: false,
			message: '无效的访问令牌'
		});
  }
};

// ========================================
// 路由配置
// ========================================

// 根路由 - 返回主页HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// API信息路由 - 访问/api/info获取API信息
app.get('/api/info', (req, res) => {
  res.json({
    message: '欢迎使用 OneLove 后端API服务！',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: {
      hasMONGODB_URI: Boolean(process.env.MONGODB_URI),
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    endpoints: {
			'/api/auth/register': '用户注册',
			'/api/auth/login': '用户登录',
			'/api/auth/me': '获取用户信息',
			'/api/auth/profile': '更新用户信息',
			'/api/auth/password': '修改密码',
			'/api/auth/logout': '用户登出',
      '/api/health': '健康检查',
			'/api/changelog': '版本信息'
    }
  });
});

// 认证API根路径 - 访问/api/auth获取认证API信息
app.get('/api/auth', (req, res) => {
  res.json({
    message: 'OneLove 认证API服务',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      '/api/auth/register': '用户注册 - POST',
      '/api/auth/login': '用户登录 - POST',
      '/api/auth/me': '获取用户信息 - GET',
      '/api/auth/profile': '更新用户信息 - PUT',
      '/api/auth/password': '修改密码 - PUT',
      '/api/auth/logout': '用户登出 - POST'
    },
    authentication: {
      type: 'JWT',
      header: 'Authorization: Bearer <token>'
    }
  });
});

// 格式化时间为 UTC+8，形如 YYYY-MM-DD HH:mm:SS
function formatUTC8(date = new Date()) {
	const utc8 = new Date(date.getTime() + (8 * 60 * 60 * 1000));
	return utc8.toISOString().slice(0, 19).replace('T', ' ');
}

// 创建changelog
app.post('/api/changelog', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const { version, order = 0, time, useAutoTime = true } = req.body;

		if (!version) {
			return res.status(400).json({ success: false, message: '版本号必填' });
		}

		const exists = await Changelog.findOne({ version });
		if (exists) {
			return res.status(400).json({ success: false, message: '该版本已存在' });
		}

		const changelog = new Changelog({
			version,
			order: Number.isFinite(order) ? order : 0,
			time: useAutoTime ? formatUTC8() : (time || formatUTC8()),
			content: [],
			createdBy: req.user?._id,
			updatedBy: req.user?._id
		});

		await changelog.save();

		res.status(201).json({ success: true, message: 'Changelog创建成功', data: changelog });
	} catch (error) {
		console.error('创建changelog失败:', error);
		res.status(500).json({ success: false, message: '创建changelog失败' });
	}
});

// 健康检查路由 - 用于监控服务状态
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: APP_VERSION,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: {
      hasMONGODB_URI: Boolean(process.env.MONGODB_URI)
    },
    dbError: global.__lastDbError || null
  });
});

// 测试用户API - 用于前端权限检查
app.get('/api/test/user', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// 验证输入
		if (!username || !email || !password) {
			return res.status(400).json({
				success: false,
				message: '用户名、邮箱和密码都是必需的'
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: '密码至少6个字符'
			});
		}

		// 检查用户是否已存在
		const existingUser = await User.findOne({
			$or: [{ username }, { email }]
		});

		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: '用户名或邮箱已被注册'
			});
		}

		// 创建新用户
		const user = new User({
			username,
			email,
			password
		});

		await user.save();

		// 生成JWT令牌
		const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

		// 更新最后登录时间
		user.lastLogin = new Date();
		await user.save();

		res.status(201).json({
			success: true,
			message: '注册成功！',
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
		console.error('注册错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误，注册失败'
		});
	}
});

// 用户登录
app.post('/api/auth/login', securityAudit, loggerMiddleware('LOGIN', '/api/auth/login'), async (req, res) => {
	try {
		const { username, password } = req.body;

		// 验证输入
		if (!username || !password) {
			return res.status(400).json({
				success: false,
				message: '用户名和密码都是必需的'
			});
		}

		// 检查数据库连接状态（若未连接则先尝试连接一次）
		if (mongoose.connection.readyState !== 1) {
			try {
				await connectDB();
			} catch (_) {}
		}

		if (mongoose.connection.readyState !== 1) {
			// 数据库未连接，使用模拟数据
			if (username === 'admin' && password === 'admin123') {
				const mockUser = {
					_id: 'mock-user-id',
					username: 'admin',
					email: 'admin@example.com',
					role: 'admin',
					isActive: true
				};

				const token = jwt.sign({ userId: mockUser._id, role: mockUser.role, username: mockUser.username, email: mockUser.email }, JWT_SECRET, { expiresIn: '7d' });

				return res.json({
					success: true,
					message: '登录成功！（模拟模式）',
					data: {
						user: {
							id: mockUser._id,
							username: mockUser.username,
							email: mockUser.email,
							role: mockUser.role
						},
						token
					}
				});
			} else {
				return res.status(401).json({
					success: false,
					message: '数据库未连接，请使用测试账户：admin / admin123'
				});
			}
		}

		// 数据库已连接，正常登录流程
		const user = await User.findOne({
			$or: [
				{ username },
				{ email: username }
			]
		});

		if (!user) {
			return res.status(401).json({
				success: false,
				message: '用户名或密码错误'
			});
		}

		if (!user.isActive) {
			return res.status(401).json({
				success: false,
				message: '账户已被禁用'
			});
		}

		// 验证密码
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: '用户名或密码错误'
			});
		}

		// 生成JWT令牌
		const token = jwt.sign({ userId: user._id, role: user.role, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

		// 更新最后登录时间
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
		console.error('登录错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误，登录失败'
		});
	}
});

// 忘记密码
app.post('/api/auth/forgot-password', async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				success: false,
				message: '邮箱地址是必需的'
			});
		}

		// 检查数据库连接状态
		if (mongoose.connection.readyState !== 1) {
			return res.status(503).json({
				success: false,
				message: '数据库未连接，请稍后重试'
			});
		}

		// 查找用户
		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: '该邮箱地址未注册'
			});
		}

		if (!user.isActive) {
			return res.status(403).json({
				success: false,
				message: '账户已被禁用，无法重置密码'
			});
		}

		// 生成重置令牌（24小时有效）
		const resetToken = jwt.sign(
			{ userId: user._id, type: 'password_reset' },
			JWT_SECRET,
			{ expiresIn: '24h' }
		);

		// 保存重置令牌到用户记录
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期
		await user.save();

		// 这里应该发送邮件，但为了简化，我们直接返回重置链接
		const resetUrl = `${req.protocol}://${req.get('host')}/Pages/reset-password.html?token=${resetToken}`;

		res.json({
			success: true,
			message: '重置密码链接已生成',
			data: {
				resetUrl: resetUrl,
				expiresIn: '24小时'
			}
		});

	} catch (error) {
		console.error('忘记密码错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误，请稍后重试'
		});
	}
});

// 重置密码
app.post('/api/auth/reset-password', async (req, res) => {
	try {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(400).json({
				success: false,
				message: '重置令牌和新密码都是必需的'
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: '密码至少需要6个字符'
			});
		}

		// 检查数据库连接状态
		if (mongoose.connection.readyState !== 1) {
			return res.status(503).json({
				success: false,
				message: '数据库未连接，请稍后重试'
			});
		}

		// 验证重置令牌
		let decoded;
		try {
			decoded = jwt.verify(token, JWT_SECRET);
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: '重置令牌无效或已过期'
			});
		}

		if (decoded.type !== 'password_reset') {
			return res.status(401).json({
				success: false,
				message: '无效的重置令牌'
			});
		}

		// 查找用户
		const user = await User.findById(decoded.userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: '用户不存在'
			});
		}

		if (!user.isActive) {
			return res.status(403).json({
				success: false,
				message: '账户已被禁用'
			});
		}

		// 检查重置令牌是否匹配且未过期
		if (user.resetPasswordToken !== token) {
			return res.status(401).json({
				success: false,
				message: '重置令牌不匹配'
			});
		}

		if (user.resetPasswordExpires < new Date()) {
			return res.status(401).json({
				success: false,
				message: '重置令牌已过期'
			});
		}

		// 更新密码
		user.password = newPassword;
		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;
		await user.save();

		res.json({
			success: true,
			message: '密码重置成功'
		});

	} catch (error) {
		console.error('重置密码错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误，请稍后重试'
		});
	}
});

// 更新用户信息
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
	try {
		const { username, email, profile } = req.body;
		const userId = req.user._id;

		// 验证输入
		if (!username || !email) {
			return res.status(400).json({
				success: false,
				message: '用户名和邮箱都是必需的'
			});
		}

		// 检查邮箱格式
		const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				success: false,
				message: '请输入有效的邮箱地址'
			});
		}

		// 检查用户名和邮箱是否已被其他用户使用
		const existingUser = await User.findOne({
			$or: [
				{ username, _id: { $ne: userId } },
				{ email: email.toLowerCase(), _id: { $ne: userId } }
			]
		});

		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: '用户名或邮箱已被使用'
			});
		}

		// 更新用户信息
		const user = await User.findById(userId);
		user.username = username;
		user.email = email.toLowerCase();

		if (profile) {
			user.profile = { ...user.profile, ...profile };
		}

		await user.save();

		res.json({
			success: true,
			message: '个人信息更新成功',
			data: {
				user: {
					id: user._id,
					username: user.username,
					email: user.email,
					role: user.role,
					profile: user.profile,
					isActive: user.isActive,
					createdAt: user.createdAt,
					lastLogin: user.lastLogin
				}
			}
		});

	} catch (error) {
		console.error('更新用户信息错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误，更新失败'
		});
	}
});

// 修改密码
app.put('/api/auth/password', authenticateToken, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user._id;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: '当前密码和新密码都是必需的'
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: '新密码至少需要6个字符'
			});
		}

		// 查找用户
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: '用户不存在'
			});
		}

		// 验证当前密码
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(401).json({
				success: false,
				message: '当前密码错误'
			});
		}

		// 更新密码
		user.password = newPassword;
		await user.save();

		res.json({
			success: true,
			message: '密码修改成功'
		});

	} catch (error) {
		console.error('修改密码错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误，修改失败'
		});
	}
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, async (req, res) => {
	try {


		res.json({
			success: true,
			data: {
				user: req.user
			}
		});
	} catch (error) {
		console.error('获取用户信息错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误'
		});
	}
});

// 用户登出
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
	try {
		res.json({
			success: true,
			message: '登出成功'
		});
	} catch (error) {
		console.error('登出错误:', error);
		res.status(500).json({
			success: false,
			message: '服务器错误'
		});
	}
});

// 用户相关路由（示例）
app.get('/api/users', async (req, res) => {
	try {
		const users = await User.find().select('-password');

		res.json({
			success: true,
			data: users,
			count: users.length
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: '获取用户列表失败'
		});
	}
});

// 获取特定用户
app.get('/api/users/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: '用户不存在'
			});
		}

		res.json({
			success: true,
			data: user
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: '获取用户信息失败'
		});
	}
});

// 数据相关路由
app.get('/api/data', (req, res) => {
  const data = {
    message: '这是来自后端的数据',
    timestamp: new Date().toISOString(),
    random: Math.random()
  };
  
  res.json({
    success: true,
    data: data
  });
});

// 用户数据统计API
app.get('/api/userdata/stats', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;

		// 获取密码数据统计
		const passwordCount = await Password.countDocuments({ userId });

		// 获取手机数据统计
		const phoneData = await Phone.findOne({ userId });
		const phoneCount = phoneData ? Object.keys(phoneData.data).length : 0;

		// 模拟笔记数据（暂时）
		const noteCount = 61;

		const result = {
			total: passwordCount + phoneCount + noteCount,
			passwords: passwordCount,
			phones: phoneCount,
			notes: noteCount
		};

		res.json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error('获取用户统计数据失败:', error);
		res.status(500).json({
			success: false,
			message: '获取统计数据失败'
		});
	}
});

// 获取密码数据API
app.get('/api/userdata/passwords', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const passwords = await Password.find({ userId });

		// 将密码记录转换为前端期望的格式，同时保留ID信息
		const formattedData = {};
		const passwordIds = {}; // 存储分类名到ID的映射
		
		passwords.forEach(password => {
			formattedData[password.category] = password.data;
			passwordIds[password.category] = password._id; // 保存ID映射
		});

		res.json({
			success: true,
			data: formattedData,
			ids: passwordIds // 返回ID映射
		});
	} catch (error) {
		console.error('获取密码数据失败:', error);
		res.status(500).json({
			success: false,
			message: '获取密码数据失败'
		});
	}
});

// 查询密码ID API
app.get('/api/userdata/passwords/query', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { category } = req.query;

		if (!category) {
			return res.status(400).json({
				success: false,
				message: '分类名不能为空'
			});
		}

		const password = await Password.findOne({ 
			userId: userId,
			category: category 
		});

		if (!password) {
			return res.status(404).json({
				success: false,
				message: '密码不存在'
			});
		}

		res.json({
			success: true,
			id: password._id,
			category: password.category
		});
	} catch (error) {
		console.error('查询密码ID失败:', error);
		res.status(500).json({
			success: false,
			message: '查询密码ID失败'
		});
	}
});

// 获取手机数据API
app.get('/api/userdata/phones', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const phoneData = await Phone.findOne({ userId });

		res.json({
			success: true,
			data: phoneData ? phoneData.data : {}
		});
	} catch (error) {
		console.error('获取手机数据失败:', error);
		res.status(500).json({
			success: false,
			message: '获取手机数据失败'
		});
	}
});

// ========================================
// 密码管理API
// ========================================

// 添加密码
app.post('/api/userdata/passwords', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { category, data } = req.body;

		if (!category || !data) {
			return res.status(400).json({
				success: false,
				message: '分类和数据不能为空'
			});
		}

		const password = new Password({
			userId: userId,
			category: category,
			data: data
		});

		await password.save();

		res.json({
			success: true,
			message: '密码添加成功',
			data: password
		});
	} catch (error) {
		console.error('添加密码失败:', error);
		res.status(500).json({
			success: false,
			message: '添加密码失败'
		});
	}
});

// 更新密码
app.put('/api/userdata/passwords/:id', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const passwordId = req.params.id;
		const { category, data } = req.body;

		const password = await Password.findOneAndUpdate(
			{ _id: passwordId, userId: userId },
			{ category, data },
			{ new: true }
		);

		if (!password) {
			return res.status(404).json({
				success: false,
				message: '密码不存在或无权限修改'
			});
		}

		res.json({
			success: true,
			message: '密码更新成功',
			data: password
		});
	} catch (error) {
		console.error('更新密码失败:', error);
		res.status(500).json({
			success: false,
			message: '更新密码失败'
		});
	}
});

// 删除密码 - 更通用的路由放在后面
app.delete('/api/userdata/passwords/:id', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const passwordId = req.params.id;

		const password = await Password.findOneAndDelete({
			_id: passwordId,
			userId: userId
		});

		if (!password) {
			return res.status(404).json({
				success: false,
				message: '密码不存在或无权限删除'
			});
		}

		res.json({
			success: true,
			message: '密码删除成功'
		});
	} catch (error) {
		console.error('删除密码失败:', error);
		res.status(500).json({
			success: false,
			message: '删除密码失败'
		});
	}
});

// 通过分类名删除密码（备用方案）- 更具体的路由放在前面
app.delete('/api/userdata/passwords/category/:category', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const category = decodeURIComponent(req.params.category);

		const password = await Password.findOneAndDelete({
			category: category,
			userId: userId
		});

		if (!password) {
			return res.status(404).json({
				success: false,
				message: '密码不存在或无权限删除'
			});
		}

		res.json({
			success: true,
			message: '密码删除成功'
		});
	} catch (error) {
		console.error('通过分类名删除密码失败:', error);
		res.status(500).json({
			success: false,
			message: '删除密码失败'
		});
	}
});

// ========================================
// 管理员API
// ========================================

// 获取所有用户列表（管理员和开发者专用）
app.get('/api/admin/users', authenticateToken, async (req, res) => {
	try {
		console.log('🔍 用户信息:', req.user);
		console.log('🔍 用户角色:', req.user.role);

		// 检查用户权限
		if (req.user.role !== 'admin' && req.user.role !== 'developer') {
			return res.status(403).json({
				success: false,
				message: '需要管理员或开发者权限'
			});
		}

		const users = await User.find().select('-password').sort({ createdAt: -1 });

		res.json({
			success: true,
			data: users,
			count: users.length,
			currentUser: req.user
		});
	} catch (error) {
		console.error('获取用户列表失败:', error);
		res.status(500).json({
			success: false,
			message: '获取用户列表失败'
		});
	}
});

// 获取所有用户的密码数据（管理员和开发者专用）
app.get('/api/admin/passwords', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const passwords = await Password.find()
			.populate('userId', 'username email role')
			.sort({ createdAt: -1 });

		res.json({
			success: true,
			data: passwords,
			count: passwords.length
		});
	} catch (error) {
		console.error('获取所有密码数据失败:', error);
		res.status(500).json({
			success: false,
			message: '获取所有密码数据失败'
		});
	}
});

// 获取所有用户的手机数据（管理员和开发者专用）
app.get('/api/admin/phones', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const phones = await Phone.find()
			.populate('userId', 'username email role')
			.sort({ createdAt: -1 });

		res.json({
			success: true,
			data: phones,
			count: phones.length
		});
	} catch (error) {
		console.error('获取所有手机数据失败:', error);
		res.status(500).json({
			success: false,
			message: '获取所有手机数据失败'
		});
	}
});

// 管理员删除任意用户的密码
app.delete('/api/admin/passwords/:id', requireAdmin, async (req, res) => {
	try {
		const passwordId = req.params.id;

		const password = await Password.findByIdAndDelete(passwordId);

		if (!password) {
			return res.status(404).json({
				success: false,
				message: '密码不存在'
			});
		}

		res.json({
			success: true,
			message: '密码删除成功'
		});
	} catch (error) {
		console.error('管理员删除密码失败:', error);
		res.status(500).json({
			success: false,
			message: '删除密码失败'
		});
	}
});

// 管理员删除任意用户的手机数据
app.delete('/api/admin/phones/:id', requireAdmin, async (req, res) => {
	try {
		const phoneId = req.params.id;

		const phone = await Phone.findByIdAndDelete(phoneId);

		if (!phone) {
			return res.status(404).json({
				success: false,
				message: '手机数据不存在'
			});
		}

		res.json({
			success: true,
			message: '手机数据删除成功'
		});
	} catch (error) {
		console.error('管理员删除手机数据失败:', error);
		res.status(500).json({
			success: false,
			message: '删除手机数据失败'
		});
	}
});

// 管理员更新用户角色
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
	try {
		const userId = req.params.id;
		const { role } = req.body;

		if (!['user', 'developer', 'admin'].includes(role)) {
			return res.status(400).json({
				success: false,
				message: '无效的角色类型'
			});
		}

		const user = await User.findByIdAndUpdate(
			userId,
			{ role },
			{ new: true }
		).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: '用户不存在'
			});
		}

		res.json({
			success: true,
			message: '用户角色更新成功',
			data: user
		});
	} catch (error) {
		console.error('更新用户角色失败:', error);
		res.status(500).json({
			success: false,
			message: '更新用户角色失败'
		});
	}
});

// 管理员禁用/启用用户
app.put('/api/admin/users/:id/status', requireAdmin, async (req, res) => {
	try {
		const userId = req.params.id;
		const { isActive } = req.body;

		const user = await User.findByIdAndUpdate(
			userId,
			{ isActive },
			{ new: true }
		).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: '用户不存在'
			});
		}

		res.json({
			success: true,
			message: `用户${isActive ? '启用' : '禁用'}成功`,
			data: user
		});
	} catch (error) {
		console.error('更新用户状态失败:', error);
		res.status(500).json({
			success: false,
			message: '更新用户状态失败'
		});
	}
});

// ========================================
// 数据迁移API
// ========================================

// 数据迁移API - 迁移密码数据
app.post('/api/migrate/passwords', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { passwordData } = req.body;

		if (!passwordData || typeof passwordData !== 'object') {
			return res.status(400).json({
				success: false,
				message: '密码数据格式错误'
			});
		}

		// 清除现有数据
		await Password.deleteMany({ userId });

		// 插入新数据
		const passwordDocs = [];
		for (const [category, data] of Object.entries(passwordData)) {
			passwordDocs.push({
				userId: userId,
				category: category,
				data: data
			});
		}

		if (passwordDocs.length > 0) {
			await Password.insertMany(passwordDocs);
		}

		res.json({
			success: true,
			message: `成功迁移 ${passwordDocs.length} 个密码类别`,
			count: passwordDocs.length
		});
	} catch (error) {
		console.error('密码数据迁移失败:', error);
		res.status(500).json({
			success: false,
			message: '密码数据迁移失败'
		});
	}
});

// 数据迁移API - 迁移手机数据
app.post('/api/migrate/phones', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { phoneData } = req.body;

		if (!phoneData || typeof phoneData !== 'object') {
			return res.status(400).json({
				success: false,
				message: '手机数据格式错误'
			});
		}

		// 清除现有数据
		await Phone.deleteMany({ userId });

		// 插入新数据
		const phoneDoc = new Phone({
			userId: userId,
			data: phoneData
		});

		await phoneDoc.save();

		res.json({
			success: true,
			message: `成功迁移 ${Object.keys(phoneData).length} 个手机号码`,
			count: Object.keys(phoneData).length
		});
	} catch (error) {
		console.error('手机数据迁移失败:', error);
		res.status(500).json({
			success: false,
			message: '手机数据迁移失败'
		});
	}
});

// ========================================
// 数据导入导出API
// ========================================

// 导出用户数据
app.get('/api/userdata/export', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { format = 'json' } = req.query;

		// 获取用户所有数据
		const passwords = await Password.find({ userId });
		const phoneData = await Phone.findOne({ userId });

		const exportData = {
			exportTime: new Date().toISOString(),
			userId: userId.toString(),
			userInfo: {
				username: req.user.username,
				email: req.user.email
			},
			data: {
				passwords: passwords,
				phones: phoneData ? phoneData.data : {}
			}
		};

		if (format === 'json') {
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', `attachment; filename="onelove-data-${Date.now()}.json"`);
			res.json(exportData);
		} else if (format === 'csv') {
			// CSV格式导出
			let csvContent = 'Type,Category,Data\n';

			// 导出密码数据
			passwords.forEach(password => {
				if (typeof password.data === 'object') {
					Object.keys(password.data).forEach(key => {
						const data = password.data[key];
						if (typeof data === 'object') {
							csvContent += `Password,${password.category},${key}: ${JSON.stringify(data)}\n`;
						} else {
							csvContent += `Password,${password.category},${key}: ${data}\n`;
						}
					});
				}
			});

			// 导出手机数据
			if (phoneData && phoneData.data) {
				Object.keys(phoneData.data).forEach(phone => {
					const data = phoneData.data[phone];
					if (typeof data === 'object') {
						csvContent += `Phone,${phone},${JSON.stringify(data)}\n`;
					} else {
						csvContent += `Phone,${phone},${data}\n`;
					}
				});
			}

			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', `attachment; filename="onelove-data-${Date.now()}.csv"`);
			res.send(csvContent);
		} else {
			res.status(400).json({
				success: false,
				message: '不支持的导出格式'
			});
		}
	} catch (error) {
		console.error('导出数据失败:', error);
		res.status(500).json({
			success: false,
			message: '导出数据失败'
		});
	}
});

// 导入用户数据
app.post('/api/userdata/import', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { data, overwrite = false } = req.body;

		if (!data || !data.data) {
			return res.status(400).json({
				success: false,
				message: '导入数据格式不正确'
			});
		}

		let importCount = 0;
		let errorCount = 0;

		// 导入密码数据
		if (data.data.passwords && Array.isArray(data.data.passwords)) {
			for (const passwordData of data.data.passwords) {
				try {
					if (overwrite) {
						// 覆盖模式：删除现有数据后插入
						await Password.findOneAndDelete({
							userId,
							category: passwordData.category
						});
					}

					const password = new Password({
						userId: userId,
						category: passwordData.category,
						data: passwordData.data
					});

					await password.save();
					importCount++;
				} catch (error) {
					console.error('导入密码数据失败:', error);
					errorCount++;
				}
			}
		}

		// 导入手机数据
		if (data.data.phones && typeof data.data.phones === 'object') {
			try {
				if (overwrite) {
					// 覆盖模式：删除现有数据
					await Phone.findOneAndDelete({ userId });
				}

				const phoneData = new Phone({
					userId: userId,
					data: data.data.phones
				});

				await phoneData.save();
				importCount++;
			} catch (error) {
				console.error('导入手机数据失败:', error);
				errorCount++;
			}
		}

		res.json({
			success: true,
			message: `数据导入完成`,
			data: {
				importCount,
				errorCount,
				totalProcessed: importCount + errorCount
			}
		});
	} catch (error) {
		console.error('导入数据失败:', error);
		res.status(500).json({
			success: false,
			message: '导入数据失败'
		});
	}
});

// 获取数据备份历史
app.get('/api/userdata/backups', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;

		// 这里可以连接到备份数据库或文件系统
		// 暂时返回模拟数据
		const backups = [
			{
				id: '1',
				name: `备份_${new Date().toISOString().split('T')[0]}`,
				size: '2.5KB',
				createdAt: new Date().toISOString(),
				type: 'auto'
			}
		];

		res.json({
			success: true,
			data: backups
		});
	} catch (error) {
		console.error('获取备份历史失败:', error);
		res.status(500).json({
			success: false,
			message: '获取备份历史失败'
		});
	}
});

// ========================================
// 数据备份/恢复API
// ========================================

// 创建数据备份
app.post('/api/userdata/backup', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { name, description = '' } = req.body;

		// 获取用户所有数据
		const passwords = await Password.find({ userId });
		const phoneData = await Phone.findOne({ userId });

		const backupData = {
			backupId: `backup_${Date.now()}`,
			name: name || `备份_${new Date().toISOString().split('T')[0]}`,
			description: description,
			createdAt: new Date().toISOString(),
			userId: userId.toString(),
			userInfo: {
				username: req.user.username,
				email: req.user.email
			},
			data: {
				passwords: passwords,
				phones: phoneData ? phoneData.data : {}
			},
			stats: {
				passwordCount: passwords.length,
				phoneCount: phoneData ? Object.keys(phoneData.data).length : 0,
				totalSize: JSON.stringify(passwords).length + JSON.stringify(phoneData ? phoneData.data : {}).length
			}
		};

		// 这里应该将备份数据存储到数据库或文件系统
		// 暂时存储在内存中（实际项目中应该使用数据库）
		if (!global.backups) {
			global.backups = {};
		}
		global.backups[backupData.backupId] = backupData;

		res.json({
			success: true,
			message: '备份创建成功',
			data: {
				backupId: backupData.backupId,
				name: backupData.name,
				createdAt: backupData.createdAt,
				stats: backupData.stats
			}
		});
	} catch (error) {
		console.error('创建备份失败:', error);
		res.status(500).json({
			success: false,
			message: '创建备份失败'
		});
	}
});

// 获取备份详情
app.get('/api/userdata/backup/:backupId', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { backupId } = req.params;

		if (!global.backups || !global.backups[backupId]) {
			return res.status(404).json({
				success: false,
				message: '备份不存在'
			});
		}

		const backup = global.backups[backupId];

		// 检查备份是否属于当前用户
		if (backup.userId !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: '无权访问此备份'
			});
		}

		res.json({
			success: true,
			data: backup
		});
	} catch (error) {
		console.error('获取备份详情失败:', error);
		res.status(500).json({
			success: false,
			message: '获取备份详情失败'
		});
	}
});

// 恢复数据备份
app.post('/api/userdata/restore/:backupId', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { backupId } = req.params;
		const { overwrite = false } = req.body;

		if (!global.backups || !global.backups[backupId]) {
			return res.status(404).json({
				success: false,
				message: '备份不存在'
			});
		}

		const backup = global.backups[backupId];

		// 检查备份是否属于当前用户
		if (backup.userId !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: '无权访问此备份'
			});
		}

		let restoreCount = 0;

		// 恢复密码数据
		if (backup.data.passwords && Array.isArray(backup.data.passwords)) {
			if (overwrite) {
				// 覆盖模式：删除现有数据
				await Password.deleteMany({ userId });
			}

			for (const passwordData of backup.data.passwords) {
				const password = new Password({
					userId: userId,
					category: passwordData.category,
					data: passwordData.data
				});
				await password.save();
				restoreCount++;
			}
		}

		// 恢复手机数据
		if (backup.data.phones && typeof backup.data.phones === 'object') {
			if (overwrite) {
				// 覆盖模式：删除现有数据
				await Phone.findOneAndDelete({ userId });
			}

			const phoneData = new Phone({
				userId: userId,
				data: backup.data.phones
			});
			await phoneData.save();
			restoreCount++;
		}

		res.json({
			success: true,
			message: '数据恢复成功',
			data: {
				backupId: backupId,
				restoreCount: restoreCount,
				restoredAt: new Date().toISOString()
			}
		});
	} catch (error) {
		console.error('恢复备份失败:', error);
		res.status(500).json({
			success: false,
			message: '恢复备份失败'
		});
	}
});

// 删除备份
app.delete('/api/userdata/backup/:backupId', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { backupId } = req.params;

		if (!global.backups || !global.backups[backupId]) {
			return res.status(404).json({
				success: false,
				message: '备份不存在'
			});
		}

		const backup = global.backups[backupId];

		// 检查备份是否属于当前用户
		if (backup.userId !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: '无权删除此备份'
			});
		}

		// 删除备份
		delete global.backups[backupId];

		res.json({
			success: true,
			message: '备份删除成功',
			data: {
				backupId: backupId,
				deletedAt: new Date().toISOString()
			}
		});
	} catch (error) {
		console.error('删除备份失败:', error);
		res.status(500).json({
			success: false,
			message: '删除备份失败'
		});
	}
});

// 获取用户访问日志
app.get('/api/userdata/access-logs', authenticateToken, securityAudit, loggerMiddleware('VIEW_LOGS', '/api/userdata/access-logs'), async (req, res) => {
	try {
		const userId = req.user._id;
		const { days = 7, action, status } = req.query;

		const AccessLog = require('./models/AccessLog');

		let query = { userId };

		if (action) {
			query.action = action;
		}

		if (status) {
			query.status = status;
		}

		const startDate = new Date();
		startDate.setDate(startDate.getDate() - parseInt(days));
		query.timestamp = { $gte: startDate };

		const logs = await AccessLog.find(query)
			.sort({ timestamp: -1 })
			.limit(100);

		res.json({
			success: true,
			data: logs
		});
	} catch (error) {
		console.error('获取访问日志失败:', error);
		res.status(500).json({
			success: false,
			message: '获取访问日志失败'
		});
	}
});

// 获取用户访问统计
app.get('/api/userdata/access-stats', authenticateToken, securityAudit, loggerMiddleware('VIEW_STATS', '/api/userdata/access-stats'), async (req, res) => {
	try {
		const userId = req.user._id;
		const { days = 7 } = req.query;

		const { getUserAccessStats } = require('./middleware/logger');
		const stats = await getUserAccessStats(userId, parseInt(days));

		res.json({
			success: true,
			data: stats
		});
	} catch (error) {
		console.error('获取访问统计失败:', error);
		res.status(500).json({
			success: false,
			message: '获取访问统计失败'
		});
	}
});

// 获取用户所有备份
app.get('/api/userdata/backups', authenticateToken, securityAudit, loggerMiddleware('VIEW_BACKUPS', '/api/userdata/backups'), async (req, res) => {
	try {
		const userId = req.user._id;

		if (!global.backups) {
			global.backups = {};
		}

		// 过滤出属于当前用户的备份
		const userBackups = Object.values(global.backups)
			.filter(backup => backup.userId === userId.toString())
			.map(backup => ({
				id: backup.backupId,
				name: backup.name,
				description: backup.description,
				size: `${Math.round(backup.stats.totalSize / 1024 * 100) / 100}KB`,
				createdAt: backup.createdAt,
				type: 'manual',
				stats: backup.stats
			}))
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		res.json({
			success: true,
			data: userBackups
		});
	} catch (error) {
		console.error('获取备份历史失败:', error);
		res.status(500).json({
			success: false,
			message: '获取备份历史失败'
		});
	}
});

// ========================================
// 批量操作API
// ========================================

// 批量删除密码数据
app.delete('/api/userdata/passwords/batch', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { ids } = req.body;

		if (!ids || !Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({
				success: false,
				message: '请选择要删除的数据'
			});
		}

		const result = await Password.deleteMany({
			_id: { $in: ids },
			userId: userId
		});

		res.json({
			success: true,
			message: `成功删除 ${result.deletedCount} 条密码数据`,
			data: {
				deletedCount: result.deletedCount
			}
		});
	} catch (error) {
		console.error('批量删除密码失败:', error);
		res.status(500).json({
			success: false,
			message: '批量删除失败'
		});
	}
});

// 批量删除手机数据
app.delete('/api/userdata/phones/batch', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { phoneNumbers } = req.body;

		if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
			return res.status(400).json({
				success: false,
				message: '请选择要删除的手机号码'
			});
		}

		const phoneData = await Phone.findOne({ userId });
		if (!phoneData) {
			return res.status(404).json({
				success: false,
				message: '未找到手机数据'
			});
		}

		let deletedCount = 0;
		phoneNumbers.forEach(phoneNumber => {
			if (phoneData.data[phoneNumber]) {
				delete phoneData.data[phoneNumber];
				deletedCount++;
			}
		});

		await phoneData.save();

		res.json({
			success: true,
			message: `成功删除 ${deletedCount} 个手机号码`,
			data: {
				deletedCount: deletedCount
			}
		});
	} catch (error) {
		console.error('批量删除手机数据失败:', error);
		res.status(500).json({
			success: false,
			message: '批量删除失败'
		});
	}
});

// 清空用户所有数据
app.delete('/api/userdata/clear', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { confirm } = req.body;

		if (confirm !== 'DELETE_ALL_DATA') {
			return res.status(400).json({
				success: false,
				message: '请确认清空操作'
			});
		}

		// 删除所有密码数据
		const passwordResult = await Password.deleteMany({ userId });

		// 删除手机数据
		const phoneResult = await Phone.findOneAndDelete({ userId });

		res.json({
			success: true,
			message: '所有数据已清空',
			data: {
				deletedPasswords: passwordResult.deletedCount,
				deletedPhones: phoneResult ? 1 : 0
			}
		});
	} catch (error) {
		console.error('清空数据失败:', error);
		res.status(500).json({
			success: false,
			message: '清空数据失败'
		});
	}
});

// 批量导出指定数据
app.post('/api/userdata/export/batch', authenticateToken, async (req, res) => {
	try {
		const userId = req.user._id;
		const { types = ['passwords', 'phones'], format = 'json' } = req.body;

		const exportData = {
			exportTime: new Date().toISOString(),
			userId: userId.toString(),
			userInfo: {
				username: req.user.username,
				email: req.user.email
			},
			data: {}
		};

		// 导出密码数据
		if (types.includes('passwords')) {
			const passwords = await Password.find({ userId });
			exportData.data.passwords = passwords;
		}

		// 导出手机数据
		if (types.includes('phones')) {
			const phoneData = await Phone.findOne({ userId });
			exportData.data.phones = phoneData ? phoneData.data : {};
		}

		if (format === 'json') {
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Disposition', `attachment; filename="onelove-batch-${Date.now()}.json"`);
			res.json(exportData);
		} else if (format === 'csv') {
			// CSV格式导出
			let csvContent = 'Type,Category,Data\n';

			// 导出密码数据
			passwords.forEach(password => {
					if (typeof password.data === 'object') {
						Object.keys(password.data).forEach(key => {
							const data = password.data[key];
							if (typeof data === 'object') {
								csvContent += `Password,${password.category},${key}: ${JSON.stringify(data)}\n`;
							} else {
								csvContent += `Password,${password.category},${key}: ${data}\n`;
							}
						});
					}
			});
		}
	} catch (error) {
		console.error('批量导出失败:', error);
		res.status(500).json({
			success: false,
			message: '批量导出失败'
		});
	}
});

// ========================================
// Changelog API
// ========================================

// 获取changelog列表
app.get('/api/changelog', async (req, res) => {
	try {
		const { limit = 100 } = req.query;
		const changelogs = await Changelog.find()
			.sort({ order: -1, createdAt: -1 })
			.limit(parseInt(limit));

		res.json({
			success: true,
			data: {
				changelogs: changelogs
			}
		});
	} catch (error) {
		console.error('获取changelog失败:', error);
		res.status(500).json({
    success: false,
			message: '获取changelog失败'
		});
	}
});

// 获取单个changelog
app.get('/api/changelog/:id', async (req, res) => {
	try {
		const changelog = await Changelog.findById(req.params.id);

		if (!changelog) {
			return res.status(404).json({
				success: false,
				message: 'Changelog不存在'
			});
		}

		res.json({
			success: true,
			data: changelog
		});
	} catch (error) {
		console.error('获取changelog失败:', error);
		res.status(500).json({
			success: false,
			message: '获取changelog失败'
		});
	}
});

// 更新changelog
app.put('/api/changelog/:id', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const { version, time } = req.body;
		const changelog = await Changelog.findByIdAndUpdate(
			req.params.id,
			{ version, time },
			{ new: true }
		);

		if (!changelog) {
			return res.status(404).json({
				success: false,
				message: 'Changelog不存在'
			});
		}

		res.json({
			success: true,
			message: 'Changelog更新成功',
			data: changelog
		});
	} catch (error) {
		console.error('更新changelog失败:', error);
		res.status(500).json({
			success: false,
			message: '更新changelog失败'
		});
	}
});

// 删除整个changelog
app.delete('/api/changelog/:id', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const deleted = await Changelog.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return res.status(404).json({ success: false, message: 'Changelog不存在' });
		}
		res.json({ success: true, message: 'Changelog删除成功' });
	} catch (error) {
		console.error('删除changelog失败:', error);
		res.status(500).json({ success: false, message: '删除changelog失败' });
	}
});

// 添加changelog条目
app.post('/api/changelog/:id/items', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const { itemTime, itemContent, useAutoTime = true } = req.body;
		const changelog = await Changelog.findById(req.params.id);

		if (!changelog) {
			return res.status(404).json({
				success: false,
				message: 'Changelog不存在'
			});
		}

		// 添加新条目（自动时间为空则生成 UTC+8 时间）
		const finalItemTime = (useAutoTime || !itemTime) ? formatUTC8() : itemTime;
		changelog.content.push({ itemTime: finalItemTime, itemContent });

		await changelog.save();

		res.json({
			success: true,
			message: '条目添加成功',
			data: changelog
		});
	} catch (error) {
		console.error('添加changelog条目失败:', error);
		res.status(500).json({
			success: false,
			message: '添加条目失败'
		});
	}
});

// 更新changelog条目
app.put('/api/changelog/:id/items/:itemIndex', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const { itemTime, itemContent, useAutoTime = true } = req.body;
		const itemIndex = parseInt(req.params.itemIndex);
		const changelog = await Changelog.findById(req.params.id);

		if (!changelog) {
			return res.status(404).json({
				success: false,
				message: 'Changelog不存在'
			});
		}

		if (itemIndex < 0 || itemIndex >= changelog.content.length) {
			return res.status(400).json({
				success: false,
				message: '条目索引无效'
			});
		}

		// 更新条目（为空或要求自动，则填充 UTC+8 当前时间）
		const finalItemTime = (useAutoTime || !itemTime) ? formatUTC8() : itemTime;
		changelog.content[itemIndex] = { itemTime: finalItemTime, itemContent };

		await changelog.save();

		res.json({
			success: true,
			message: '条目更新成功',
			data: changelog
		});
	} catch (error) {
		console.error('更新changelog条目失败:', error);
		res.status(500).json({
			success: false,
			message: '更新条目失败'
		});
	}
});

// 删除changelog某个子条目
app.delete('/api/changelog/:id/items/:itemIndex', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const itemIndex = parseInt(req.params.itemIndex);
		const changelogId = req.params.id;
		console.log('[DELETE /api/changelog/:id/items/:itemIndex]', { changelogId, itemIndex });
		const changelog = await Changelog.findById(changelogId);

		if (!changelog) {
			return res.status(404).json({ success: false, message: `Changelog不存在: ${changelogId}` });
		}

		if (!Array.isArray(changelog.content)) {
			return res.status(400).json({ success: false, message: '内容格式无效' });
		}

		if (Number.isNaN(itemIndex) || itemIndex < 0 || itemIndex >= changelog.content.length) {
			return res.status(400).json({ success: false, message: `条目索引无效: ${itemIndex}` });
		}

		changelog.content.splice(itemIndex, 1);
		await changelog.save();

		res.json({ success: true, message: '条目删除成功', data: { id: changelog._id, remaining: changelog.content.length } });
	} catch (error) {
		console.error('删除changelog条目失败:', error);
		res.status(500).json({ success: false, message: '删除条目失败' });
	}
});

// ========================================
// Timeline数据API
// ========================================

// 删除timeline数据
app.delete('/api/timeline-data/:id', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const timelineData = await TimelineData.findByIdAndDelete(req.params.id);

		if (!timelineData) {
			return res.status(404).json({
				success: false,
				message: 'Timeline数据不存在'
			});
		}

		res.json({
			success: true,
			message: 'Timeline数据删除成功'
		});
	} catch (error) {
		console.error('删除timeline数据失败:', error);
		res.status(500).json({
			success: false,
			message: '删除timeline数据失败'
		});
	}
});


// 新增单个 Timeline 子项（仅针对数组型data）
app.post('/api/timeline-data/:type/items', authenticateToken, async (req, res) => {
	try {
		const { type } = req.params;
		const role = req.user?.role;
		const isPrivileged = role === 'developer' || role === 'admin';
		if (!isPrivileged && type !== 'myPast') {
			return res.status(403).json({ success: false, message: '普通用户仅能新增自己的 myPast 数据' });
		}

		const targetUserId = req.user._id;
		const item = req.body && typeof req.body === 'object' ? req.body : null;
		if (!item || !item.title || !item.time || !Array.isArray(item.content)) {
			return res.status(400).json({ success: false, message: '缺少必要字段：title、time、content[]' });
		}

		// 映射类型到数据库字段
		const typeMapping = {
			'myPast': 'myPastData',
			'health': 'healthData'
		};
		const dbType = typeMapping[type];
		if (!dbType) {
			return res.status(400).json({ success: false, message: '无效的数据类型' });
		}

		const newItem = { ...item, _id: item._id || new mongoose.Types.ObjectId().toString() };
		let doc = await TimelineData.findOne({ userId: targetUserId, type: dbType });
		if (!doc) {
			doc = new TimelineData({ userId: targetUserId, type: dbType, data: [newItem], timestamp: new Date() });
			await doc.save();
		} else {
			doc.data = Array.isArray(doc.data) ? [...doc.data, newItem] : [newItem];
			doc.timestamp = new Date();
			await doc.save();
		}

		return res.json({ success: true, message: '添加成功', data: { id: newItem._id } });
	} catch (error) {
		console.error('添加Timeline子项失败:', error);
		return res.status(500).json({ success: false, message: '保存失败' });
	}
});

// 更新单个 Timeline 子项
app.put('/api/timeline-data/:type/items/:itemId', authenticateToken, async (req, res) => {
	try {
		const { type, itemId } = req.params;
		const role = req.user?.role;
		const isPrivileged = role === 'developer' || role === 'admin';
		if (!isPrivileged && type !== 'myPast') {
			return res.status(403).json({ success: false, message: '普通用户仅能编辑自己的 myPast 数据' });
		}

		const targetUserId = req.user._id;
		const updates = req.body && typeof req.body === 'object' ? req.body : {};

		// 映射类型到数据库字段
		const typeMapping = {
			'myPast': 'myPastData',
			'health': 'healthData'
		};
		const dbType = typeMapping[type];
		if (!dbType) {
			return res.status(400).json({ success: false, message: '无效的数据类型' });
		}

		let doc;
		if (isPrivileged) {
			// 开发者/管理员：搜索所有用户的文档来找到要编辑的条目（兼容旧/新type）
			const compatibleTypes = [dbType, 'myPast', 'myPastData', 'health', 'healthData'];
			console.log(`🔍 开发者编辑调试 - 搜索类型: ${compatibleTypes.join(', ')}, 目标itemId: ${itemId}`);
			const docs = await TimelineData.find({ type: { $in: compatibleTypes } });
			console.log(`🔍 找到 ${docs.length} 个文档`);
			
			// 详细调试每个文档
			docs.forEach((d, index) => {
				console.log(`🔍 文档 ${index}: userId=${d.userId}, type=${d.type}, data长度=${Array.isArray(d.data) ? d.data.length : 'N/A'}`);
				if (Array.isArray(d.data)) {
					d.data.forEach((item, itemIndex) => {
						console.log(`🔍   条目 ${itemIndex}: _id=${item._id}, title=${item.title}`);
					});
				}
			});
			
			doc = docs.find(d => d && Array.isArray(d.data) && d.data.some(item => item && item._id === itemId));
			console.log(`🔍 找到匹配的文档: ${doc ? '是' : '否'}`);
		} else {
			// 普通用户：只能编辑自己的数据（兼容旧/新type）
			const typesToTry = [dbType, 'myPast', 'myPastData', 'health', 'healthData'];
			doc = await TimelineData.findOne({ userId: targetUserId, type: { $in: typesToTry } });
		}

		if (!doc || !Array.isArray(doc.data)) {
			return res.status(404).json({ success: false, message: '未找到数据' });
		}

		let found = false;
		doc.data = doc.data.map(it => {
			if (it && it._id === itemId) {
				found = true;
				return { ...it, ...updates, _id: itemId };
			}
			return it;
		});

		if (!found) return res.status(404).json({ success: false, message: '未找到该条目' });
		doc.timestamp = new Date();
		await doc.save();
		return res.json({ success: true, message: '更新成功' });
	} catch (error) {
		console.error('更新Timeline子项失败:', error);
		return res.status(500).json({ success: false, message: '更新失败' });
	}
});

// 删除单个 Timeline 子项
app.delete('/api/timeline-data/:type/items/:itemId', authenticateToken, async (req, res) => {
	try {
		const { type, itemId } = req.params;
		const role = req.user?.role;
		const isPrivileged = role === 'developer' || role === 'admin';
		if (!isPrivileged && type !== 'myPast') {
			return res.status(403).json({ success: false, message: '普通用户仅能删除自己的 myPast 数据' });
		}

		// 映射类型到数据库字段
		const typeMapping = {
			'myPast': 'myPastData',
			'health': 'healthData'
		};
		const dbType = typeMapping[type];
		if (!dbType) {
			return res.status(400).json({ success: false, message: '无效的数据类型' });
		}

		let doc;
		if (isPrivileged) {
			// 开发者/管理员：搜索所有用户的文档来找到要删除的条目（兼容旧/新type）
			const compatibleTypes = [dbType, 'myPast', 'myPastData', 'health', 'healthData'];
			console.log(`🔍 开发者删除调试 - 搜索类型: ${compatibleTypes.join(', ')}, 目标itemId: ${itemId}`);
			const docs = await TimelineData.find({ type: { $in: compatibleTypes } });
			console.log(`🔍 找到 ${docs.length} 个文档`);
			
			// 详细调试每个文档
			docs.forEach((d, index) => {
				console.log(`🔍 文档 ${index}: userId=${d.userId}, type=${d.type}, data长度=${Array.isArray(d.data) ? d.data.length : 'N/A'}`);
				if (Array.isArray(d.data)) {
					d.data.forEach((item, itemIndex) => {
						console.log(`🔍   条目 ${itemIndex}: _id=${item._id}, title=${item.title}`);
					});
				}
			});
			
			doc = docs.find(d => d && Array.isArray(d.data) && d.data.some(item => item && item._id === itemId));
			console.log(`🔍 找到匹配的文档: ${doc ? '是' : '否'}`);
		} else {
			// 普通用户：只能删除自己的数据（兼容旧/新type）
			const targetUserId = req.user._id;
			const typesToTry = [dbType, 'myPast', 'myPastData', 'health', 'healthData'];
			doc = await TimelineData.findOne({ userId: targetUserId, type: { $in: typesToTry } });
		}

		if (!doc || !Array.isArray(doc.data)) {
			return res.status(404).json({ success: false, message: '未找到数据' });
		}

		const originalLen = doc.data.length;
		doc.data = doc.data.filter(it => it && it._id !== itemId);
		if (doc.data.length === originalLen) {
			return res.status(404).json({ success: false, message: '未找到该条目' });
		}
		doc.timestamp = new Date();
		doc.updatedBy = req.user._id;
		await doc.save();
		return res.json({ success: true, message: '删除成功' });
	} catch (error) {
		console.error('删除Timeline子项失败:', error);
		return res.status(500).json({ success: false, message: '删除失败' });
	}
});

// ========================================

// 调试API - 获取所有timeline数据
app.get('/api/timeline-data-debug', async (req, res) => {
	try {
		console.log('🔍 调试API: 查询所有TimelineData...');
		
		// 检查数据库连接
		console.log('📊 数据库连接状态:', mongoose.connection.readyState);
		console.log('📊 数据库名称:', mongoose.connection.name);
		
		// 检查集合是否存在
		const collections = await mongoose.connection.db.listCollections().toArray();
		console.log('📊 数据库中的所有集合:', collections.map(c => c.name));
		
		// 检查timelinedatas集合
		const timelineDataExists = collections.find(c => c.name === 'timelinedatas');
		console.log('📊 timelinedatas集合是否存在:', !!timelineDataExists);
		
		if (timelineDataExists) {
			// 直接查询原生集合
			const rawData = await mongoose.connection.db.collection('timelinedatas').find({}).toArray();
			console.log(`📊 原生查询timelinedatas集合: ${rawData.length}条数据`);
			
			if (rawData.length > 0) {
				console.log('📝 原生数据第一条样例:', JSON.stringify(rawData[0], null, 2));
			}
		}
		
		// 使用Mongoose模型查询
		const allData = await TimelineData.find({}).lean();
		console.log(`📊 Mongoose模型查询结果: ${allData.length}条数据`);
		
		// 按类型分组
		const groupedData = {};
		allData.forEach(item => {
			if (!groupedData[item.type]) {
				groupedData[item.type] = [];
			}
			groupedData[item.type].push(item);
		});
		
		console.log('📊 按类型分组的数据:', Object.keys(groupedData).map(type => `${type}: ${groupedData[type].length}条`));
		
		res.json({
			success: true,
			debug: true,
			dbStatus: {
				connected: mongoose.connection.readyState === 1,
				dbName: mongoose.connection.name,
				collections: collections.map(c => c.name),
				timelineDataExists: !!timelineDataExists
			},
			total: allData.length,
			groupedCount: Object.keys(groupedData).map(type => ({ type, count: groupedData[type].length })),
			data: allData,
			groupedData,
			rawDataSample: timelineDataExists ? await mongoose.connection.db.collection('timelinedatas').findOne({}) : null
		});
	} catch (error) {
		console.error('调试API失败:', error);
		res.status(500).json({
			success: false,
			message: '调试API失败',
			error: error.message
		});
	}
});

// 获取timeline数据
app.get('/api/timeline-data/:type', authenticateToken, async (req, res) => {
	try {
		const { type } = req.params;

		// 与 Functions 版本对齐：普通用户仅可访问自己的 myPast
		const role = req.user?.role;
		const isPrivileged = role === 'developer' || role === 'admin';
		// 普通用户只能访问自己的 myPast 数据，但可以访问所有人的 health 数据
		if (!isPrivileged && type !== 'myPast' && type !== 'health') {
			return res.status(403).json({ success: false, message: '普通用户仅能访问自己的 myPast 数据和所有人的 health 数据' });
		}
		
		// 验证类型并映射到数据库中的实际值
		const typeMapping = {
			'myPast': 'myPastData',
			'health': 'healthData'
		};
		
		if (!typeMapping[type]) {
			return res.status(400).json({
				success: false,
				message: '无效的数据类型'
			});
		}
		
		const dbType = typeMapping[type];

		// 检查数据库连接状态
		if (!mongoose.connection || mongoose.connection.readyState !== 1) {
			// 数据库未连接，返回模拟数据
			const mockData = {
				myPast: [
					{
						_id: 'mock-1',
						title: '大学毕业',
						time: '2020-06-15 10:00:00',
						content: [{ itemContent: '完成了计算机科学学士学位，开始人生新的篇章' }],
						images: [],
						videos: []
					},
					{
						_id: 'mock-2',
						title: '第一份工作',
						time: '2020-08-01 09:00:00',
						content: [{ itemContent: '开始在一家科技公司担任软件工程师，学习到了很多实用技能' }],
						images: [],
						videos: []
					}
				],
				health: [
					{
						_id: 'mock-3',
						title: '年度体检',
						time: '2024-01-15 08:30:00',
						content: [{ itemContent: '完成年度健康检查，各项指标正常，继续保持良好的生活习惯' }],
						images: [],
						videos: []
					},
					{
						_id: 'mock-4',
						title: '健身计划',
						time: '2024-03-01 18:00:00',
						content: [{ itemContent: '开始每周三次的健身计划，包括有氧运动和力量训练' }],
						images: [],
						videos: []
					}
				]
			};
			
			console.log(`⚠️ 数据库未连接，返回${type}模拟数据`);
			return res.json({
				success: true,
				data: mockData[type] || [],
				message: '数据库未连接，返回模拟数据'
			});
		}

		// 从数据库获取数据
		console.log(`🔍 正在查询数据库中的${type}数据...`);
		
		if (isPrivileged) {
			// 开发者/管理员：可以查看所有用户的数据
		let timelineItems = await TimelineData.find({ type: dbType })
			.populate('userId', 'username name')
			.sort({ time: -1, createdAt: -1 })
			.lean();
		
			console.log(`📊 开发者查询结果: 找到${timelineItems.length}条${type}数据`);
		
			// 如果没有找到数据，尝试兼容查询
		if (timelineItems.length === 0) {
				const compatibleTypes = ['myPast', 'health', 'work', 'study'];
				for (const compatibleType of compatibleTypes) {
					timelineItems = await TimelineData.find({ type: compatibleType })
						.populate('userId', 'username name')
						.sort({ time: -1, createdAt: -1 })
						.lean();
						if (timelineItems.length > 0) break;
					}
				}
				
			// 处理数据格式
			const processedData = timelineItems.map(doc => {
				const userDisplayName = doc.userId ? (doc.userId.username || doc.userId.name || doc.userId._id) : 'unknown';
				if (Array.isArray(doc.data)) {
					return doc.data.map(item => ({
						...item,
						_userIdentifier: userDisplayName
					}));
				} else {
					return [{
						...doc,
						_userIdentifier: userDisplayName
					}];
				}
			}).flat();

			return res.json({
				success: true,
				data: processedData,
				count: processedData.length,
				message: `找到${processedData.length}条数据`
			});
		} else {
			// 普通用户：只能查看自己的数据
			if (type === 'myPast') {
				// 查找当前用户的 myPast 数据
				let userData = await TimelineData.findOne({ 
					userId: req.user._id, 
					type: dbType 
				}).sort({ timestamp: -1 });

				// 如果没有找到，尝试兼容查询
				if (!userData) {
					const compatibleTypes = ['myPast', 'myPastData'];
					for (const compatibleType of compatibleTypes) {
						userData = await TimelineData.findOne({ 
							userId: req.user._id, 
							type: compatibleType 
						}).sort({ timestamp: -1 });
						if (userData) break;
					}
				}

				if (!userData || !Array.isArray(userData.data) || userData.data.length === 0) {
					return res.json({
						success: true,
						data: [],
						message: '您还没有创建任何记录',
						isEmpty: true
					});
				}

				return res.json({
					success: true,
					data: userData.data,
					timestamp: userData.timestamp || userData.updatedAt || userData.createdAt
				});
			} else if (type === 'health') {
				// 普通用户可以查看所有人的 health 数据
				let healthData = await TimelineData.find({ type: dbType })
					.sort({ time: -1, createdAt: -1 })
					.lean();

				// 如果没有找到，尝试兼容查询
				if (healthData.length === 0) {
					const compatibleTypes = ['health', 'healthData'];
					for (const compatibleType of compatibleTypes) {
						healthData = await TimelineData.find({ type: compatibleType })
							.sort({ time: -1, createdAt: -1 })
							.lean();
						if (healthData.length > 0) break;
					}
				}

				// 处理数据格式
				const processedData = healthData.map(doc => {
					if (Array.isArray(doc.data)) {
						return doc.data;
					} else {
						return [doc];
					}
				}).flat();

				return res.json({
			success: true,
					data: processedData,
					count: processedData.length,
					message: `找到${processedData.length}条健康数据`
		});
			}
		}
	} catch (error) {
		console.error('获取timeline数据失败:', error);
		return res.status(500).json({
			success: false,
			message: '获取timeline数据失败: ' + error.message
		});
	}
});

// 创建timeline数据
app.post('/api/timeline-data', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const { type, title, content, images = [], videos = [] } = req.body;
		
		// 验证输入
		if (!type || !title || !content || !Array.isArray(content) || content.length === 0) {
			return res.status(400).json({
				success: false,
				message: '类型、标题和内容都是必需的'
			});
		}

		if (!['myPast', 'health'].includes(type)) {
			return res.status(400).json({
				success: false,
				message: '无效的数据类型'
			});
		}

		// 创建新的timeline数据
		const timelineData = new TimelineData({
			type,
			title,
			time: formatUTC8(),
			content,
			images: Array.isArray(images) ? images : [],
			videos: Array.isArray(videos) ? videos : [],
			createdBy: req.user?._id,
			updatedBy: req.user?._id
		});

		await timelineData.save();

		res.status(201).json({
			success: true,
			message: 'Timeline数据创建成功',
			data: timelineData
		});
	} catch (error) {
		console.error('创建timeline数据失败:', error);
		res.status(500).json({
			success: false,
			message: '创建timeline数据失败'
		});
	}
});

// 更新timeline数据
app.put('/api/timeline-data/:id', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	try {
		const { title, time, content, images = [], videos = [] } = req.body;
		
		// 验证输入
		if (!title || !time || !content || !Array.isArray(content) || content.length === 0) {
			return res.status(400).json({
				success: false,
				message: '标题、时间和内容都是必需的'
			});
		}

		const timelineData = await TimelineData.findByIdAndUpdate(
			req.params.id,
			{
				title,
				time,
				content,
				images: Array.isArray(images) ? images : [],
				videos: Array.isArray(videos) ? videos : [],
				updatedBy: req.user?._id
			},
			{ new: true }
		);

		if (!timelineData) {
			return res.status(404).json({
				success: false,
				message: 'Timeline数据不存在'
			});
		}

		res.json({
			success: true,
			message: 'Timeline数据更新成功',
			data: timelineData
		});
	} catch (error) {
		console.error('更新timeline数据失败:', error);
		res.status(500).json({
			success: false,
			message: '更新timeline数据失败'
		});
	}
});

// ========================================
// 启动服务器
// ========================================

// 启动服务器函数
const startServer = async () => {
	try {
		// 连接数据库
		const dbConnected = await connectDB();
		
		// 启动服务器
		app.listen(PORT, () => {
			console.log('🚀 OneLove 后端服务器启动成功！');
			console.log(`📡 服务器地址: http://localhost:${PORT}`);
			console.log(`🌐 API地址: http://localhost:${PORT}/api`);
			console.log(`📊 数据库状态: ${dbConnected ? '已连接' : '未连接（使用模拟数据）'}`);
			console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
			console.log('='.repeat(50));
		});
	} catch (error) {
		console.error('❌ 服务器启动失败:', error);
		process.exit(1);
	}
};

// 如果作为独立服务器运行，则启动监听；在无服务器环境（Netlify Functions）中仅导出 app
if (require.main === module) {
  // 启动服务器
  startServer();
} else {
  // Functions/Serverless 环境：初始化数据库连接（只在首次加载时调用）
  // 忽略连接失败，代码会在部分路由使用模拟模式
  (async () => {
    try {
      await connectDB();
    } catch (_) {}
  })();
}

// 导出app和serverless handler
module.exports = app;
module.exports.handler = serverless(app);
