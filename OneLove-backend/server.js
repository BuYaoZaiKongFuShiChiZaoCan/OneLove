// ========================================
// OneLove 后端服务器 - 完整版本
// ========================================

// 导入必要的模块
const express = require('express');        // Express框架 - 用于创建Web服务器
const cors = require('cors');              // CORS中间件 - 处理跨域请求
const helmet = require('helmet');          // 安全中间件 - 添加安全头
const morgan = require('morgan');          // 日志中间件 - 记录请求日志
const path = require('path');              // 路径模块 - 处理文件路径
const mongoose = require('mongoose');      // 导入mongoose
const bcrypt = require('bcryptjs');        // 密码加密
const jwt = require('jsonwebtoken');       // JWT令牌

// 导入中间件
const { requireAdmin } = require('./middleware/auth');
const { loggerMiddleware, securityAudit, logAccess } = require('./middleware/logger');

// 导入数据模型
const User = require('./models/User');
const Changelog = require('./models/Changelog');

// 创建Express应用实例
const app = express();

// 设置端口号（Vercel会自动提供PORT环境变量）
const PORT = process.env.PORT || 3000;

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'OneLove_JWT_Secret_2024_Production_Key_For_Security';

// 加载环境变量
require('dotenv').config({ path: './config.env' });

// ========================================
// 连接数据库
// ========================================
const connectDB = async () => {
	try {
		const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/?retryWrites=true&w=majority&appName=OneLove';

		console.log('🔗 正在连接数据库...');

		const conn = await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
		console.log(`📊 数据库名称: ${conn.connection.name}`);
		return true;

	} catch (error) {
		console.error('❌ 数据库连接失败:', error.message);
		console.log('⚠️ 开发模式：将使用内存数据继续运行');
		return false;
	}
};

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
		process.env.CORS_ORIGIN
	].filter(Boolean), // 允许的域名
	credentials: true  // 允许携带凭证（cookies等）
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
		version: '5.0.2',
		timestamp: new Date().toISOString(),
		database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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
		version: '5.0.2',
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

// 健康检查路由 - 用于监控服务状态
app.get('/api/health', (req, res) => {
	res.json({
		status: 'healthy',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
		version: '5.0.2',
		database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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

		// 检查数据库连接状态
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

				const token = jwt.sign({ userId: mockUser._id }, JWT_SECRET, { expiresIn: '7d' });

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
		const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

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

		// 将密码记录转换为前端期望的格式
		const formattedData = {};
		passwords.forEach(password => {
			formattedData[password.category] = password.data;
		});

		res.json({
			success: true,
			data: formattedData
		});
	} catch (error) {
		console.error('获取密码数据失败:', error);
		res.status(500).json({
			success: false,
			message: '获取密码数据失败'
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

// 删除密码
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

// ========================================
// 管理员API
// ========================================

// 获取所有用户列表（管理员专用）- 临时调试版本
app.get('/api/admin/users', authenticateToken, async (req, res) => {
	try {
		console.log('🔍 用户信息:', req.user);
		console.log('🔍 用户角色:', req.user.role);

		// 临时允许所有已登录用户访问
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

// 获取所有用户的密码数据（管理员专用）
app.get('/api/admin/passwords', requireAdmin, async (req, res) => {
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

// 获取所有用户的手机数据（管理员专用）
app.get('/api/admin/phones', requireAdmin, async (req, res) => {
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

		if (!['user', 'admin'].includes(role)) {
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

			if (exportData.data.passwords) {
				exportData.data.passwords.forEach(password => {
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

			if (exportData.data.phones) {
				Object.keys(exportData.data.phones).forEach(phone => {
					const data = exportData.data.phones[phone];
					if (typeof data === 'object') {
						csvContent += `Phone,${phone},${JSON.stringify(data)}\n`;
					} else {
						csvContent += `Phone,${phone},${data}\n`;
					}
				});
			}

			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', `attachment; filename="onelove-batch-${Date.now()}.csv"`);
			res.send(csvContent);
		} else {
			res.status(400).json({
				success: false,
				message: '不支持的导出格式'
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
// 错误处理中间件
// ========================================

// ========================================
// Changelog API路由
// ========================================

// 获取changelog列表
app.get('/api/changelog', async (req, res) => {
	try {
		const { version, limit = 10, page = 1 } = req.query;

		let query = {};
		if (version) {
			query.version = version;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const changelogs = await Changelog.find(query)
			.sort({ order: -1, createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Changelog.countDocuments(query);

		res.json({
			success: true,
			data: {
				changelogs,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / parseInt(limit))
				}
			}
		});
	} catch (error) {
		console.error('获取changelog失败:', error);
		res.status(500).json({
			success: false,
			message: '获取版本信息失败'
		});
	}
});

// 获取最新版本信息
app.get('/api/changelog/latest', async (req, res) => {
	try {
		const latestVersion = await Changelog.findOne()
			.sort({ order: -1, createdAt: -1 });

		if (!latestVersion) {
			return res.status(404).json({
				success: false,
				message: '未找到版本信息'
			});
		}

		res.json({
			success: true,
			data: latestVersion
		});
	} catch (error) {
		console.error('获取最新版本失败:', error);
		res.status(500).json({
			success: false,
			message: '获取最新版本信息失败'
		});
	}
});

// ========================================
// 测试API路由
// ========================================

// 测试API - 检查当前用户信息
app.get('/api/test/user', authenticateToken, async (req, res) => {
	try {
		res.json({
			success: true,
			user: req.user,
			message: '当前用户信息'
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: '获取用户信息失败'
		});
	}
});

// 测试管理员权限
app.get('/api/test/admin', requireAdmin, async (req, res) => {
	try {
		res.json({
			success: true,
			user: req.user,
			message: '管理员权限验证成功'
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: '管理员权限验证失败'
		});
	}
});

// 404错误处理 - 当访问不存在的路由时
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		message: '请求的路径不存在',
		path: req.originalUrl
	});
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
	console.error('服务器错误:', err);

	res.status(500).json({
		success: false,
		message: '服务器内部错误',
		error: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
	});
});

// ========================================
// 启动服务器
// ========================================

const startServer = async () => {
	// 尝试连接数据库
	const dbConnected = await connectDB();

	// 启动服务器
	app.listen(PORT, () => {
		console.log(`🚀 服务器已启动！`);
		console.log(`📍 本地访问地址: http://localhost:${PORT}`);
		console.log(`🌐 健康检查: http://localhost:${PORT}/api/health`);
		console.log(`🔐 认证API: http://localhost:${PORT}/api/auth`);
		console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
		console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
		console.log(`📦 版本: 5.0.2`);
		console.log(`💾 数据库状态: ${dbConnected ? '已连接' : '未连接（模拟模式）'}`);
	});
};

startServer();

// 优雅关闭处理
process.on('SIGTERM', () => {
	console.log('收到SIGTERM信号，正在关闭服务器...');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('收到SIGINT信号，正在关闭服务器...');
	process.exit(0);
}); 