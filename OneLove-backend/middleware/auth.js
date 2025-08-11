// ========================================
// JWT 认证中间件
// ========================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT密钥（从环境变量获取，开发环境使用默认值）
const JWT_SECRET = process.env.JWT_SECRET || 'onelove-secret-key-2025';

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // 7天过期
  );
};

// 验证JWT令牌中间件
const authenticateToken = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失，请先登录'
      });
    }

    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或令牌无效'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '账户已被禁用'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期，请重新登录'
      });
    }

    console.error('认证中间件错误:', error);
      return res.status(500).json({
        success: false,
      message: '服务器认证错误'
      });
  }
};

// 可选认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
    const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
      }
    }

    next();
  } catch (error) {
    // 可选认证失败不影响请求继续
    next();
  }
};

// 管理员权限中间件
const requireAdmin = async (req, res, next) => {
  try {
    // 首先验证用户身份
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

    // 检查用户是否为管理员
    if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }

    req.user = user;
  next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: '权限验证失败'
    });
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
}; 