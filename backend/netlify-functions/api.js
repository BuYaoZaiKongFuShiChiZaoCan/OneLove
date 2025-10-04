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
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
if (!JWT_SECRET) {
	console.error('配置缺失: JWT_SECRET 未设置');
}
if (!MONGODB_URI) {
	console.error('配置缺失: MONGODB_URI 未设置');
}


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
userSchema.methods.comparePassword = async function (candidatePassword) {
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

// ========== 加密工具与密码/手机模型 ==========
const Encryption = require('../utils/encryption');

const passwordSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	category: { type: String, required: true },
	data: { type: mongoose.Schema.Types.Mixed, required: true },
	isEncrypted: { type: Boolean, default: false },
	encryptionIv: { type: String, default: null },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

passwordSchema.pre('save', function (next) {
	if (this.isModified('data') && !this.isEncrypted) {
		const encrypted = Encryption.encryptObject(this.data);
		if (encrypted) {
			this.data = encrypted.encrypted;
			this.encryptionIv = encrypted.iv;
			this.isEncrypted = true;
		}
	}
	this.updatedAt = new Date();
	next();
});

passwordSchema.post('find', function (docs) {
	if (docs && Array.isArray(docs)) {
		docs.forEach(doc => {
			if (doc.isEncrypted && doc.encryptionIv) {
				const decrypted = Encryption.decryptObject(doc.data, doc.encryptionIv);
				if (decrypted) doc.data = decrypted;
			}
		});
	}
});

passwordSchema.post('findOne', function (doc) {
	if (doc && doc.isEncrypted && doc.encryptionIv) {
		const decrypted = Encryption.decryptObject(doc.data, doc.encryptionIv);
		if (decrypted) doc.data = decrypted;
	}
});

const phoneSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	data: { type: mongoose.Schema.Types.Mixed, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

const Password = mongoose.models.Password || mongoose.model('Password', passwordSchema);
const Phone = mongoose.models.Phone || mongoose.model('Phone', phoneSchema);

// 文件系统结构模型
const fileSystemStructureSchema = new mongoose.Schema({
  structure: { type: mongoose.Schema.Types.Mixed, required: true },
  excludedFiles: { type: mongoose.Schema.Types.Mixed, required: true },
  directory: { type: String, required: true },
  isRealData: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
  environment: { type: String, required: true }
});

const FileSystemStructure = mongoose.models.FileSystemStructure || mongoose.model('FileSystemStructure', fileSystemStructureSchema);
const fs = require('fs');
const path = require('path');
const util = require('util');
const promisify = util.promisify;

// 排除的文件配置 - 与主服务server.js保持一致
const excludedFiles = {
  // 排除的文件扩展名
  extensions: [
    'tmp', 'temp', 'cache', 'log', 'bak', 'backup', 'old',
    'swp', 'swo', '~', 'DS_Store', 'Thumbs.db', 'desktop.ini',
    'node_modules', '.git', '.svn', '.hg', '.bzr'
  ],
  // 排除的文件名模式（支持通配符）
  patterns: [
    '*.tmp', '*.temp', '*.cache', '*.log', '*.bak', '*.backup', '*.old',
    '.*', 'node_modules', '.git*', '.svn*', '.DS_Store', 'Thumbs.db',
    'desktop.ini', '*.swp', '*.swo', '*.~*'
  ],
  // 排除的目录名
  directories: [
    'node_modules', '.git', '.svn', '.hg', '.bzr', '__pycache__',
    '.vscode', '.idea', '.vs', 'bin', 'obj', 'dist', 'build',
    'coverage', '.nyc_output', 'logs', 'temp', 'tmp'
  ]
};

// 检查文件是否应该被排除 - 与主服务server.js保持一致
function shouldExcludeFile(fileName, isDirectory = false) {
  const name = fileName.toLowerCase();
  
  // 避免排除重要的应用目录
  const importantDirs = ['biji', 'resources', 'music', 'images'];
  if (isDirectory && importantDirs.some(dir => name.includes(dir))) {
    return false;
  }
  
  // 检查目录排除列表 - 只排除明确列出的系统目录
  if (isDirectory) {
    return excludedFiles.directories.includes(name);
  }
  
  // 检查文件扩展名排除列表
  const extension = name.split('.').pop();
  // 只排除系统临时文件和配置文件，不排除用户文件
  const systemExtensions = ['tmp', 'temp', 'cache', 'log', 'bak', 'backup', 'old', 'swp', 'swo'];
  const isSystemFile = systemExtensions.includes(extension) || 
                      name.startsWith('.') || 
                      ['thumbs.db', 'desktop.ini', '.ds_store'].includes(name);
                       
  return isSystemFile;
}

// 扫描目录结构函数
async function scanDirectory(dirPath) {
  try {
    const entries = await promisify(fs.readdir)(dirPath, { withFileTypes: true });
    const items = [];
    
    for (const entry of entries) {
      const isDir = entry.isDirectory();
      const isFile = entry.isFile();
      
      // 检查是否应该排除此文件/目录
      if (shouldExcludeFile(entry.name, isDir)) {
        continue; // 跳过被排除的文件/目录
      }
      
      const fullPath = path.join(dirPath, entry.name);
      
      if (isDir) {
        // 递归扫描子目录
        const subItems = await scanDirectory(fullPath);
        items.push({
          name: entry.name,
          type: 'directory',
          path: fullPath.replace(/\\/g, '/'),
          items: subItems
        });
      } else if (isFile) {
        // 获取文件信息
        const stats = await promisify(fs.stat)(fullPath);
        items.push({
          name: entry.name,
          type: 'file',
          path: fullPath.replace(/\\/g, '/'),
          size: stats.size,
          modified: stats.mtime.getTime(),
          extension: path.extname(entry.name).toLowerCase()
        });
      }
    }
    
    // 排序：目录在前，文件在后；同名按字母顺序
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, 'zh-CN');
    });
    
    return items;
  } catch (error) {
    console.error('扫描目录失败:', error);
    return [];
  }
}

// 辅助函数：将数组结构转换为前端期望的对象结构
function convertArrayToObjectStructure(arrayItems, basePath = '') {
  const result = {};
  
  arrayItems.forEach(item => {
    // 确定图标类型
    let icon = 'fas fa-file'; // 默认图标
    if (item.type === 'directory') {
      icon = 'fas fa-folder';
    } else if (item.extension) {
      // 根据文件扩展名设置不同图标
      switch (item.extension) {
        case '.html':
        case '.htm':
          icon = 'fas fa-file-code';
          break;
        case '.md':
          icon = 'fas fa-file-alt';
          break;
        case '.json':
          icon = 'fas fa-file-json';
          break;
        case '.txt':
          icon = 'fas fa-file-text';
          break;
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
        case '.bmp':
          icon = 'fas fa-image';
          break;
        case '.svg':
          icon = 'fas fa-file-image';
          break;
        case '.pdf':
          icon = 'fas fa-file-pdf';
          break;
        case '.doc':
        case '.docx':
          icon = 'fas fa-file-word';
          break;
        case '.xls':
        case '.xlsx':
          icon = 'fas fa-file-excel';
          break;
        case '.ppt':
        case '.pptx':
          icon = 'fas fa-file-powerpoint';
          break;
        case '.zip':
        case '.rar':
        case '.7z':
          icon = 'fas fa-file-archive';
          break;
        case '.js':
          icon = 'fab fa-js';
          break;
        case '.css':
          icon = 'fab fa-css3-alt';
          break;
        case '.php':
          icon = 'fab fa-php';
          break;
        case '.py':
          icon = 'fab fa-python';
          break;
        case '.mp3':
        case '.wav':
        case '.ogg':
          icon = 'fas fa-file-audio';
          break;
        case '.mp4':
        case '.avi':
        case '.mov':
          icon = 'fas fa-file-video';
          break;
      }
    }
    
    if (item.type === 'directory' && item.items && item.items.length > 0) {
      // 递归处理子目录
      result[item.name] = convertArrayToObjectStructure(item.items, basePath + item.name + '/');
    } else {
      // 处理文件
      result[item.name] = {
        type: item.type,
        icon: icon,
        size: item.size || 0,
        modified: item.modified ? new Date(item.modified).toISOString() : new Date().toISOString(),
        path: basePath + item.name
      };
    }
  });
  
  return result;
}

// 连接数据库
const connectDB = async () => {
	try {
		if (mongoose.connection.readyState === 1) {
			console.log('✅ 数据库已连接');
			return true;
		}

		console.log('🔗 正在连接数据库...');
		// 显式传入 dbName，防止未在连接串内指定时默认到 test
		const explicitDbName = process.env.MONGODB_DB || 'onelove';
		await mongoose.connect(MONGODB_URI, {
			serverSelectionTimeoutMS: 10000,
			socketTimeoutMS: 45000,
			dbName: explicitDbName,
		});

		console.log('✅ MongoDB 连接成功，使用数据库:', mongoose.connection?.name || explicitDbName);
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

// API信息
app.get('/api/info', (req, res) => {
	res.json({
		message: '欢迎使用 OneLove 无服务器API（Netlify Functions）',
		version: APP_VERSION,
		timestamp: new Date().toISOString(),
		environment: 'netlify-functions',
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

// 简单数据（用于前端连通性测试）
app.get('/api/data', (req, res) => {
	const data = {
		message: '这是来自 Netlify Functions 的数据',
		timestamp: new Date().toISOString(),
		random: Math.random()
	};
	res.json({ success: true, data });
});

// 获取Data目录结构API
app.get('/api/data/structure', async (req, res) => {
  try {
    console.log('🔍 尝试获取Data目录结构');
    
    // 检测是否为生产环境
    const isProductionEnvironment = process.env.NETLIFY || process.env.NODE_ENV === 'production';
    
    // 在生产环境中，首先尝试从数据库获取数据
    if (isProductionEnvironment) {
      console.log('🌐 检测到生产环境，尝试从数据库获取文件结构数据');
      try {
        const dbConnected = await connectDB();
        if (dbConnected) {
          // 获取最新的文件结构数据
          const latestStructure = await FileSystemStructure.findOne().sort({ timestamp: -1 });
          
          if (latestStructure) {
            console.log('✅ 成功从数据库获取文件结构数据');
            return res.json({
              success: true,
              data: latestStructure.structure,
              timestamp: latestStructure.timestamp.toISOString(),
              directory: latestStructure.directory || 'database-sourced',
              realData: latestStructure.isRealData,
              isProductionEnvironment: true,
              dataSource: 'database',
              excludedFiles: latestStructure.excludedFiles || excludedFiles
            });
          } else {
            console.warn('⚠️  数据库中没有找到文件结构数据');
            // 继续执行，尝试扫描文件系统
          }
        } else {
          console.warn('⚠️  数据库连接失败，尝试扫描文件系统');
        }
      } catch (dbError) {
        console.error('❌ 从数据库获取数据时发生错误:', dbError);
        // 继续执行，尝试扫描文件系统
      }
    }
    // 尝试多个可能的Data目录路径
    const possiblePaths = [
      // 在Netlify Functions环境中，尝试相对于当前文件的路径
      path.join(__dirname, '..', '..', 'Data'),
      // 尝试相对于backend目录的路径
      path.join(__dirname, '..', 'Data'),
      // 尝试在不同的部署环境中可能的路径
      path.join(process.cwd(), 'Data'),
      // 绝对路径（仅在本地开发时有效）
      'd:/学习笔记/项目/My/H5/OneLove/Data'
    ];
    
    let dataDir = null;
    
    // 测试所有可能的路径，找到第一个存在的
    for (const testPath of possiblePaths) {
      try {
        await promisify(fs.access)(testPath);
        console.log('✅ 找到有效Data目录:', testPath);
        dataDir = testPath;
        break;
      } catch (e) {
        console.log('❌ 路径不存在:', testPath);
      }
    }
    
    // 如果没有找到有效的Data目录，记录详细信息并尝试其他方案
    if (!dataDir) {
      console.error('❌ 所有尝试的Data目录路径都不存在');
      console.log('📋 项目目录信息:');
      console.log('- 当前工作目录:', process.cwd());
      console.log('- __dirname:', __dirname);
      
      // 在Netlify环境中，尝试列出当前目录内容来帮助诊断
      try {
        const currentDirFiles = await promisify(fs.readdir)(__dirname);
        console.log('📁 当前目录文件:', currentDirFiles);
        
        const parentDirFiles = await promisify(fs.readdir)(path.join(__dirname, '..'));
        console.log('📁 父目录文件:', parentDirFiles);
      } catch (dirError) {
        console.error('❌ 无法读取目录内容:', dirError.message);
      }
      
      // 在这种情况下，我们可能确实无法访问真实文件系统
      // 返回带有诊断信息的模拟数据，而不是空数据
      const diagnosticMockData = {
        '诊断信息.txt': {
          type: 'file',
          icon: 'fas fa-file-alt',
          size: 0,
          modified: new Date().toISOString(),
          path: '诊断信息.txt'
        },
        '路径问题说明': {
          type: 'file',
          icon: 'fas fa-file-alt',
          size: 0,
          modified: new Date().toISOString(),
          path: '路径问题说明.txt'
        }
      };
      
      return res.json({
        success: true,
        data: diagnosticMockData,
        message: '无法访问Data目录，请检查路径和权限配置',
        timestamp: new Date().toISOString(),
        environment: 'path-not-found',
        attemptedPaths: possiblePaths,
        currentWorkingDir: process.cwd(),
        dirname: __dirname,
        excludedFiles: excludedFiles
      });
    }
    
    // 扫描Data目录结构
    console.log('🔍 开始扫描Data目录:', dataDir);
    const arrayStructure = await scanDirectory(dataDir);
    console.log('📊 扫描完成，发现项目数:', arrayStructure.length);
    
    // 转换为前端期望的对象结构
    const objectStructure = convertArrayToObjectStructure(arrayStructure);
    console.log('🔄 已将数组结构转换为对象结构');
    
    // 检测是否为本地环境
    const isLocalEnvironment = !process.env.NETLIFY && process.env.NODE_ENV !== 'production';
    
    // 在本地环境中，将数据上传到数据库
    if (isLocalEnvironment) {
      console.log('🖥️  检测到本地环境，准备将数据上传到数据库');
      try {
        const dbConnected = await connectDB();
        if (dbConnected) {
          // 检查是否已存在最新的文件结构数据
          const existingStructure = await FileSystemStructure.findOne().sort({ timestamp: -1 });
          
          // 创建新的数据结构记录
          const newFileSystemStructure = new FileSystemStructure({
            structure: objectStructure,
            excludedFiles: excludedFiles,
            directory: dataDir,
            isRealData: true,
            environment: 'local-development'
          });
          
          await newFileSystemStructure.save();
          console.log('✅ 数据成功上传到数据库');
        } else {
          console.warn('⚠️  数据库连接失败，无法上传数据');
        }
      } catch (dbError) {
        console.error('❌ 上传数据到数据库时发生错误:', dbError);
      }
    } else {
      console.log('🌐 检测到生产环境，将从数据库获取数据或返回扫描结果');
    }
    
    res.json({
      success: true,
      data: objectStructure,
      timestamp: new Date().toISOString(),
      directory: dataDir,
      realData: true,
      isLocalEnvironment: isLocalEnvironment,
      dataUploaded: isLocalEnvironment,
      excludedFiles: excludedFiles // 返回完整的排除配置对象
    });
    
  } catch (error) {
    console.error('❌ 获取Data目录结构失败:', error);
    console.error('❌ 错误详情:', error.stack);
    
    // 提供详细的错误诊断信息，而不是简单的模拟数据
    const errorDiagnosticData = {
      '错误日志.txt': {
        type: 'file',
        icon: 'fas fa-file-alt',
        size: 0,
        modified: new Date().toISOString(),
        path: '错误日志.txt'
      },
      '技术支持信息': {
        type: 'file',
        icon: 'fas fa-file-alt',
        size: 0,
        modified: new Date().toISOString(),
        path: '技术支持信息.txt'
      }
    };
    
    res.status(200).json({
      success: false, // 明确标记为失败
      data: errorDiagnosticData,
      message: '获取Data目录结构时发生错误',
      error: error.message,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
      environment: process.env.NETLIFY ? 'netlify-production' : 'unknown',
      diagnostics: {
        attemptedPaths: possiblePaths || [],
        currentWorkingDir: process.cwd(),
        dirname: __dirname,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage()
      },
      excludedFiles: excludedFiles
    });
  }
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
	const { allUsers } = req.query;

	console.log(`📊 获取Timeline数据请求 - 类型: ${type} allUsers=${allUsers}`);

	try {
		const dbConnected = await connectDB();
		if (!dbConnected) {
			return res.status(500).json({ success: false, message: '数据库连接失败' });
		}

		// 权限：普通用户仅允许访问自己的 myPast 数据
		const isPrivileged = req.user?.role === 'developer' || req.user?.role === 'admin';
		// 普通用户只能访问自己的 myPast 数据，但可以访问所有人的 health 数据
		if (!isPrivileged && type !== 'myPast' && type !== 'health') {
			return res.status(403).json({ success: false, message: '普通用户仅能访问自己的 myPast 数据和所有人的 health 数据' });
		}

		// 开发者可查看所有用户该类型数据
		if (allUsers === 'true' && (req.user?.role === 'developer' || req.user?.role === 'admin')) {
			// 兼容旧数据结构：直接查询type字段
			let docs = await TimelineData.find({ type }).populate('userId', 'username name').sort({ timestamp: -1 }).limit(200);
			
			// 如果没有找到数据，尝试查询兼容的字段名
			if (docs.length === 0) {
				const compatibleTypes = {
					'myPast': 'myPastData',
					'health': 'healthData',
					'work': 'workData', 
					'study': 'studyData'
				};
				
				const compatibleType = compatibleTypes[type];
				if (compatibleType) {
					docs = await TimelineData.find({ type: compatibleType }).populate('userId', 'username name').limit(200);
				}
			}

			// 按time字段排序（如果有的话），否则按时间戳排序
			docs.sort((a, b) => {
				// 优先按time字段排序（字符串格式的日期）
				if (a.time && b.time) {
					const timeA = new Date(a.time);
					const timeB = new Date(b.time);
					if (!isNaN(timeA.getTime()) && !isNaN(timeB.getTime())) {
						return timeB - timeA; // 降序，最新的在前面
					}
				}
				// 备用排序：按时间戳
				const timestampA = a.timestamp || a.updatedAt || a.createdAt;
				const timestampB = b.timestamp || b.updatedAt || b.createdAt;
				return new Date(timestampB) - new Date(timestampA);
			});

			const payload = docs.map(doc => {
				const userDisplayName = doc.userId ? (doc.userId.username || doc.userId.name || doc.userId._id) : 'system';
				return {
					userId: userDisplayName, // 使用用户名而不是ID
					data: Array.isArray(doc.data) ? doc.data : [doc], // 如果没有data字段，将整个文档作为数据
					timestamp: doc.timestamp || doc.updatedAt || doc.createdAt
				};
			});
			
			return res.json({ success: true, data: payload, count: payload.length });
		}

		// 普通用户：根据类型处理
		if (type === 'myPast') {
			// 普通用户只能查看自己的 myPast 数据
			let userData = await TimelineData.findOne({
			userId: req.user.userId,
			type: type
		}).sort({ timestamp: -1 });

		// 如果没有找到数据，尝试查询兼容的字段名
			if (!userData) {
			const compatibleTypes = {
					'myPast': 'myPastData'
			};
			
			const compatibleType = compatibleTypes[type];
			if (compatibleType) {
					userData = await TimelineData.findOne({
					userId: req.user.userId,
					type: compatibleType
				}).sort({ timestamp: -1 });
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

			// 返回数据，兼容旧结构
			const data = Array.isArray(userData.data) ? userData.data : [userData];
			return res.json({
				success: true,
				data: data,
				timestamp: userData.timestamp || userData.updatedAt || userData.createdAt
			});
		} else if (type === 'health') {
			// 普通用户可以查看所有人的 health 数据
			let healthData = await TimelineData.find({ type: type })
				.sort({ time: -1, createdAt: -1 })
				.lean();

			// 如果没有找到数据，尝试查询兼容的字段名
			if (healthData.length === 0) {
			const compatibleTypes = {
					'health': 'healthData'
			};
			
			const compatibleType = compatibleTypes[type];
			if (compatibleType) {
					healthData = await TimelineData.find({ type: compatibleType })
						.sort({ time: -1, createdAt: -1 })
						.lean();
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
	} catch (error) {
		console.error(`❌ 获取${type}数据错误:`, error);
		return res.status(500).json({ success: false, message: `获取${type}数据失败` });
	}
});

// 新增/更新 Timeline 数据（upsert）
app.post('/api/timeline-data', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const { userId, type, data } = req.body || {};
		if (!type || !Array.isArray(data)) {
			return res.status(400).json({ success: false, message: '参数无效：需要 type 与 data[]' });
		}

		// 权限：普通用户仅能写自己的 myPast；开发者/管理员不限
		const isPrivileged = req.user?.role === 'developer' || req.user?.role === 'admin';
		if (!isPrivileged && type !== 'myPast') {
			return res.status(403).json({ success: false, message: '普通用户仅能修改自己的 myPast 数据' });
		}
		const targetUserId = isPrivileged ? (userId || req.user.userId) : req.user.userId;

		const now = new Date();
		const withStableIds = (Array.isArray(data) ? data : []).map(item => ({
			...item,
			_id: item && item._id ? item._id : new mongoose.Types.ObjectId().toString()
		}));

		const doc = await TimelineData.findOneAndUpdate(
			{ userId: targetUserId, type },
			{ $set: { data: withStableIds }, $setOnInsert: { userId: targetUserId, type }, $currentDate: { timestamp: true } },
			{ new: true, upsert: true }
		);

		// 补充时间戳（某些驱动不支持 $currentDate 设置到自定义字段时）
		if (!doc.timestamp) {
			doc.timestamp = now;
			await doc.save();
		}

		return res.json({ success: true, data: { userId: targetUserId, type, count: Array.isArray(doc.data) ? doc.data.length : 0 }, message: '保存成功' });
	} catch (error) {
		console.error('❌ 保存Timeline数据失败:', error);
		return res.status(500).json({ success: false, message: '保存失败' });
	}
});

// 删除 Timeline 数据
app.delete('/api/timeline-data/:id', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ success: false, message: '缺少项目ID' });
		}

		// 权限：普通用户仅能删除自己的 myPast 数据；开发者/管理员可删除任意数据
		const isPrivileged = req.user?.role === 'developer' || req.user?.role === 'admin';
		
		if (isPrivileged) {
			// 开发者/管理员可以删除任意数据
			const deletedDoc = await TimelineData.findByIdAndDelete(id);
			if (!deletedDoc) {
				return res.status(404).json({ success: false, message: '项目不存在' });
			}
			return res.json({ success: true, message: '删除成功' });
		} else {
			// 普通用户只能删除自己的 myPast 数据
			const doc = await TimelineData.findById(id);
			if (!doc) {
				return res.status(404).json({ success: false, message: '项目不存在' });
			}
			if (doc.userId !== req.user.userId || doc.type !== 'myPast') {
				return res.status(403).json({ success: false, message: '权限不足，只能删除自己的 myPast 数据' });
			}
			
			await TimelineData.findByIdAndDelete(id);
			return res.json({ success: true, message: '删除成功' });
		}
	} catch (error) {
		console.error('❌ 删除Timeline数据失败:', error);
		return res.status(500).json({ success: false, message: '删除失败' });
	}
});

// 新增单个 Timeline 子项（仅针对数组型data）
app.post('/api/timeline-data/:type/items', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const { type } = req.params;
		const isPrivileged = req.user?.role === 'developer' || req.user?.role === 'admin';
		if (!isPrivileged && type !== 'myPast') {
			return res.status(403).json({ success: false, message: '普通用户仅能新增自己的 myPast 数据' });
		}

		const targetUserId = req.user.userId;
		const item = req.body && typeof req.body === 'object' ? req.body : null;
		
		// 验证必要字段
		if (!item || !item.title || !item.time) {
			return res.status(400).json({ success: false, message: '缺少必要字段：title、time' });
		}

		// 确保content是数组格式
		if (!Array.isArray(item.content)) {
			return res.status(400).json({ success: false, message: 'content字段必须是数组格式' });
		}

		// 添加发布者信息
		const newItem = { 
			...item, 
			_id: item._id || new mongoose.Types.ObjectId().toString(),
			createdBy: targetUserId,
			createdAt: new Date(),
			updatedBy: targetUserId,
			updatedAt: new Date()
		};

		// 查找或创建文档
		let doc = await TimelineData.findOne({ userId: targetUserId, type });
		if (!doc) {
			// 创建新文档，避免命中历史唯一索引(type+title)冲突
			doc = new TimelineData({ 
				userId: targetUserId, 
				type, 
				title: String(targetUserId),
				data: [newItem], 
				timestamp: new Date(),
				createdBy: targetUserId,
				updatedBy: targetUserId
			});
			console.log('创建新文档:', doc);
		} else {
			// 更新现有文档
			doc.data = Array.isArray(doc.data) ? [...doc.data, newItem] : [newItem];
			doc.timestamp = new Date();
			doc.updatedBy = targetUserId;
			console.log('更新现有文档，data长度:', doc.data.length);
		}

		await doc.save();
		console.log('文档保存成功，ID:', doc._id);

		return res.json({ success: true, message: '添加成功', data: { id: newItem._id } });
	} catch (error) {
		console.error('❌ 添加Timeline子项失败:', error);
		return res.status(500).json({ success: false, message: '保存失败: ' + error.message });
	}
});

// 更新单个 Timeline 子项
app.put('/api/timeline-data/:type/items/:itemId', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const { type, itemId } = req.params;
		const isPrivileged = req.user?.role === 'developer' || req.user?.role === 'admin';
		if (!isPrivileged && type !== 'myPast') {
			return res.status(403).json({ success: false, message: '普通用户仅能编辑自己的 myPast 数据' });
		}

		const targetUserId = req.user.userId;
		const updates = req.body && typeof req.body === 'object' ? req.body : {};

		const doc = await TimelineData.findOne({ userId: targetUserId, type });
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
		console.error('❌ 更新Timeline子项失败:', error);
		return res.status(500).json({ success: false, message: '更新失败' });
	}
});

// 删除单个 Timeline 子项
app.delete('/api/timeline-data/:type/items/:itemId', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const { type, itemId } = req.params;
		const isPrivileged = req.user?.role === 'developer' || req.user?.role === 'admin';
		if (!isPrivileged && type !== 'myPast') {
			return res.status(403).json({ success: false, message: '普通用户仅能删除自己的 myPast 数据' });
		}

		let doc;
		if (isPrivileged) {
			// 开发者/管理员：搜索所有用户的文档来找到要删除的条目（兼容旧/新type）
			const compatibleTypes = [type, 'myPast', 'myPastData', 'health', 'healthData'];
			console.log(`🔍 Netlify开发者删除调试 - 搜索类型: ${compatibleTypes.join(', ')}, 目标itemId: ${itemId}`);
			const docs = await TimelineData.find({ type: { $in: compatibleTypes } });
			console.log(`🔍 Netlify找到 ${docs.length} 个文档`);
			
			// 详细调试每个文档
			docs.forEach((d, index) => {
				console.log(`🔍 Netlify文档 ${index}: userId=${d.userId}, type=${d.type}, data长度=${Array.isArray(d.data) ? d.data.length : 'N/A'}`);
				if (Array.isArray(d.data)) {
					d.data.forEach((item, itemIndex) => {
						console.log(`🔍 Netlify  条目 ${itemIndex}: _id=${item._id}, title=${item.title}`);
					});
				}
			});
			
			doc = docs.find(d => d && Array.isArray(d.data) && d.data.some(item => item && item._id === itemId));
			console.log(`🔍 Netlify找到匹配的文档: ${doc ? '是' : '否'}`);
		} else {
			// 普通用户：只能删除自己的数据（兼容旧/新type）
			const targetUserId = req.user.userId;
			doc = await TimelineData.findOne({ userId: targetUserId, type: { $in: [type, 'myPast', 'myPastData', 'health', 'healthData'] } });
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
		doc.updatedBy = req.user.userId;
		await doc.save();
		return res.json({ success: true, message: '删除成功' });
	} catch (error) {
		console.error('❌ 删除Timeline子项失败:', error);
		return res.status(500).json({ success: false, message: '删除失败' });
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

// ========== UserData 统计 ==========
app.get('/api/userdata/stats', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const user = await User.findById(req.user.userId);
		if (!user) return res.status(404).json({ success: false, message: '用户不存在' });

		// 开发者：返回全站汇总
		if (user.role === 'developer') {
			const [passwordCount, phoneDocs] = await Promise.all([
				Password.countDocuments({}),
				Phone.find({}, 'data')
			]);
			const phoneCount = phoneDocs.reduce((sum, doc) => sum + Object.keys(doc.data || {}).length, 0);
			const noteCount = 0;
			return res.json({
				success: true,
				data: {
					total: passwordCount + phoneCount + noteCount,
					passwords: passwordCount,
					phones: phoneCount,
					notes: noteCount,
					lastLogin: user.lastLogin || null
				}
			});
		}

		// 非开发者：仅统计本人
		const userId = user._id;
		const [passwordCount, phoneDoc] = await Promise.all([
			Password.countDocuments({ userId }),
			Phone.findOne({ userId })
		]);
		const phoneCount = phoneDoc ? Object.keys(phoneDoc.data || {}).length : 0;
		const noteCount = 0;

		return res.json({
			success: true,
			data: {
				total: passwordCount + phoneCount + noteCount,
				passwords: passwordCount,
				phones: phoneCount,
				notes: noteCount,
				lastLogin: user.lastLogin || null
			}
		});
	} catch (error) {
		console.error('❌ 获取用户数据统计失败:', error);
		return res.status(500).json({ success: false, message: '统计失败' });
	}
});

// ========== UserData 密码/手机 CRUD 与查询 ==========
// 获取密码数据
app.get('/api/userdata/passwords', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		// 仅开发者可请求所有用户数据（管理员不包含在内）
		if (String(req.query.all).toLowerCase() === 'true') {
			const role = req.user?.role;
			if (role !== 'developer') {
				return res.status(403).json({ success: false, message: '需要开发者权限' });
			}
			const all = await Password.find().populate('userId', 'username email role');
			return res.json({ success: true, data: all, count: all.length });
		}

		const userId = req.user.userId;
		const passwords = await Password.find({ userId });

		const formattedData = {};
		const passwordIds = {};
		passwords.forEach(p => {
			formattedData[p.category] = p.data;
			passwordIds[p.category] = p._id;
		});

		return res.json({ success: true, data: formattedData, ids: passwordIds });
	} catch (error) {
		console.error('❌ 获取密码列表失败:', error);
		return res.status(500).json({ success: false, message: '获取密码数据失败' });
	}
});

// 查询密码ID（按分类）
app.get('/api/userdata/passwords/query', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const { category } = req.query;
		if (!category) return res.status(400).json({ success: false, message: '分类名不能为空' });

		const password = await Password.findOne({ userId, category });
		if (!password) return res.status(404).json({ success: false, message: '密码不存在' });
		return res.json({ success: true, id: password._id, category: password.category });
	} catch (error) {
		console.error('❌ 查询密码ID失败:', error);
		return res.status(500).json({ success: false, message: '查询失败' });
	}
});

// 新增密码
app.post('/api/userdata/passwords', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const { category, data } = req.body || {};
		if (!category || !data) return res.status(400).json({ success: false, message: '分类和数据不能为空' });

		const created = await Password.create({ userId, category, data });
		return res.json({ success: true, message: '密码添加成功', data: created });
	} catch (error) {
		console.error('❌ 添加密码失败:', error);
		return res.status(500).json({ success: false, message: '添加失败' });
	}
});

// 更新密码
app.put('/api/userdata/passwords/:id', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const passwordId = req.params.id;
		const { category, data } = req.body || {};

		const updated = await Password.findOneAndUpdate(
			{ _id: passwordId, userId },
			{ category, data, updatedAt: new Date(), isEncrypted: false },
			{ new: true }
		);
		if (!updated) return res.status(404).json({ success: false, message: '密码不存在或无权限修改' });
		return res.json({ success: true, message: '密码更新成功', data: updated });
	} catch (error) {
		console.error('❌ 更新密码失败:', error);
		return res.status(500).json({ success: false, message: '更新失败' });
	}
});

// 删除密码（按ID）
app.delete('/api/userdata/passwords/:id', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const passwordId = req.params.id;
		const deleted = await Password.findOneAndDelete({ _id: passwordId, userId });
		if (!deleted) return res.status(404).json({ success: false, message: '密码不存在或无权限删除' });
		return res.json({ success: true, message: '密码删除成功' });
	} catch (error) {
		console.error('❌ 删除密码失败:', error);
		return res.status(500).json({ success: false, message: '删除失败' });
	}
});

// 通过分类名删除密码
app.delete('/api/userdata/passwords/category/:category', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const category = decodeURIComponent(req.params.category);
		const deleted = await Password.findOneAndDelete({ userId, category });
		if (!deleted) return res.status(404).json({ success: false, message: '密码不存在或无权限删除' });
		return res.json({ success: true, message: '密码删除成功' });
	} catch (error) {
		console.error('❌ 通过分类名删除密码失败:', error);
		return res.status(500).json({ success: false, message: '删除失败' });
	}
});

// 获取手机数据
app.get('/api/userdata/phones', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		// 仅开发者可请求所有用户数据（管理员不包含在内）
		if (String(req.query.all).toLowerCase() === 'true') {
			const role = req.user?.role;
			if (role !== 'developer') {
				return res.status(403).json({ success: false, message: '需要开发者权限' });
			}
			const allPhones = await Phone.find().populate('userId', 'username email role');
			return res.json({ success: true, data: allPhones, count: allPhones.length });
		}

		const userId = req.user.userId;
		const phoneDoc = await Phone.findOne({ userId });
		return res.json({ success: true, data: phoneDoc ? phoneDoc.data : {} });
	} catch (error) {
		console.error('❌ 获取手机数据失败:', error);
		return res.status(500).json({ success: false, message: '获取失败' });
	}
});

// 新增或覆盖手机数据
app.post('/api/userdata/phones', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const { data } = req.body || {};
		if (!data || typeof data !== 'object') return res.status(400).json({ success: false, message: '手机数据格式错误' });

		let phoneDoc = await Phone.findOne({ userId });
		if (!phoneDoc) {
			phoneDoc = await Phone.create({ userId, data });
		} else {
			phoneDoc.data = data;
			phoneDoc.updatedAt = new Date();
			await phoneDoc.save();
		}
		return res.json({ success: true, message: '手机数据保存成功' });
	} catch (error) {
		console.error('❌ 保存手机数据失败:', error);
		return res.status(500).json({ success: false, message: '保存失败' });
	}
});

// 更新单个手机记录键值对
app.put('/api/userdata/phones/:id', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const { key, value } = req.body || {};
		if (!key) return res.status(400).json({ success: false, message: '缺少 key' });
		const phoneDoc = await Phone.findOne({ userId });
		if (!phoneDoc) return res.status(404).json({ success: false, message: '未找到手机数据' });
		phoneDoc.data[key] = value;
		phoneDoc.updatedAt = new Date();
		await phoneDoc.save();
		return res.json({ success: true, message: '更新成功' });
	} catch (error) {
		console.error('❌ 更新手机数据失败:', error);
		return res.status(500).json({ success: false, message: '更新失败' });
	}
});

// 删除单个手机记录（按键）
app.delete('/api/userdata/phones/:id', authenticateToken, async (req, res) => {
	try {
		const dbConnected = await connectDB();
		if (!dbConnected) return res.status(500).json({ success: false, message: '数据库连接失败' });

		const userId = req.user.userId;
		const key = req.params.id;
		const phoneDoc = await Phone.findOne({ userId });
		if (!phoneDoc || !phoneDoc.data || !(key in phoneDoc.data)) {
			return res.status(404).json({ success: false, message: '该手机记录不存在' });
		}
		delete phoneDoc.data[key];
		phoneDoc.updatedAt = new Date();
		await phoneDoc.save();
		return res.json({ success: true, message: '删除成功' });
	} catch (error) {
		console.error('❌ 删除手机数据失败:', error);
		return res.status(500).json({ success: false, message: '删除失败' });
	}
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
app.put('/api/admin/users/:id/role', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
	return res.json({ success: true, message: 'role updated (placeholder)', id: req.params.id, role: req.body?.role || 'user' });
});
// 管理禁用/启用用户
app.put('/api/admin/users/:id/status', authenticateToken, requireDeveloperOrAdmin, async (req, res) => {
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