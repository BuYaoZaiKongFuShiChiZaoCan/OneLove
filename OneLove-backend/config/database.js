// ========================================
// MongoDB 数据库配置文件
// ========================================

const mongoose = require('mongoose');

// 数据库连接函数
const connectDB = async () => {
  try {
    // 获取数据库连接字符串（从环境变量或使用本地连接）
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/onelove_db';
    
    console.log('🔗 正在连接数据库...');
    
    // 连接数据库
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5秒超时
      socketTimeoutMS: 45000, // 45秒socket超时
    });

    console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`📊 数据库名称: ${conn.connection.name}`);
    
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
    
    // 如果是开发环境，提供更详细的错误信息
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔧 故障排除建议:');
      console.log('1. 检查MONGODB_URI环境变量是否正确');
      console.log('2. 确认MongoDB Atlas网络访问设置');
      console.log('3. 验证用户名和密码是否正确');
      console.log('4. 检查网络连接是否正常');
    }
    
    // 在开发环境中，我们可以继续运行（使用内存数据）
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ 开发模式：将使用内存数据继续运行');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB; 