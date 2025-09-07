// ========================================
// MongoDB 数据库配置文件
// ========================================

const mongoose = require('mongoose');

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
    
    // 连接数据库
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 0,
      family: 4,
      dbName: dbName
    });

    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`📊 数据库名称: ${conn.connection.name}`);
    return true;
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB 连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB 连接断开');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB 重新连接成功');
    });

    // 优雅关闭
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 MongoDB 连接已关闭');
      process.exit(0);
    });

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

module.exports = connectDB; 