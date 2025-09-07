// ========================================
// MongoDB 数据库配置文件
// ========================================

const mongoose = require('mongoose');

// 单例缓存，适配无服务器环境
let connectPromise = null;
let hasListenersBound = false;

// 数据库连接函数
const connectDB = async () => {
  try {
    // 已连接直接返回，避免无服务器环境重复建连
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return true;
    }

    // 获取数据库连接字符串（从环境变量或使用本地连接）
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onelove_db';
    const dbName = process.env.DB_NAME || 'OneLove';
    
    console.log('🔗 正在连接数据库...');
    
    // 绑定一次事件监听
    if (!hasListenersBound) {
      hasListenersBound = true;
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB 连接错误:', err);
      });
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB 连接断开');
      });
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB 重新连接成功');
      });
    }

    // 带重试的连接（最多3次指数退避）
    const maxAttempts = 3;
    const baseDelayMs = 400;
    const attemptConnect = async (attempt) => {
      try {
        const conn = await mongoose.connect(mongoURI, {
          serverSelectionTimeoutMS: 8000,
          connectTimeoutMS: 8000,
          socketTimeoutMS: 45000,
          maxPoolSize: 5,
          minPoolSize: 0,
          family: 4,
          dbName: dbName
        });
        return conn;
      } catch (err) {
        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          console.log(`⏳ 连接失败，第${attempt}次重试后等待 ${delay}ms:`, err.message);
          await new Promise(r => setTimeout(r, delay));
          return attemptConnect(attempt + 1);
        }
        throw err;
      }
    };

    if (!connectPromise) {
      connectPromise = attemptConnect(1);
    }
    const conn = await connectPromise;

    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`📊 数据库名称: ${conn.connection.name}`);
    return true;

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    global.__lastDbError = {
      name: error.name,
      code: error.code,
      message: error.message
    };
    // 在无服务器环境或生产环境，不应直接退出进程；返回 false 由上层决定降级策略
    return false;
  }
};

// 导出状态/实例给调用方（可选使用）
const getMongoose = () => mongoose;
const getConnectionState = () => mongoose.connection?.readyState ?? 0;

module.exports = connectDB;
module.exports.getMongoose = getMongoose;
module.exports.getConnectionState = getConnectionState;