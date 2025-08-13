const mongoose = require('mongoose');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: './config.env' });

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000
});

console.log('🔗 正在连接数据库...');

// 导入Changelog模型
const Changelog = require('./models/Changelog');

// 直接导入changelog数据
let changelogData;
try {
  // 导入changelog数据
  const changelogModule = require('../Pages/About/changelog.js');
  changelogData = changelogModule.versionLogs;
  
  if (!changelogData || !Array.isArray(changelogData)) {
    throw new Error('无法获取versionLogs数据');
  }
  
  console.log('✅ 成功解析changelog数据');
  console.log(`📊 共找到 ${changelogData.length} 个版本记录`);
  
} catch (error) {
  console.error('❌ 解析changelog数据失败:', error);
  process.exit(1);
}

// 上传到数据库
async function uploadChangelog() {
  try {
    console.log('🚀 开始上传changelog到数据库...');
    
    // 清空现有数据
    await Changelog.deleteMany({});
    console.log('🗑️ 已清空现有changelog数据');
    
    // 上传新数据
    const uploadPromises = changelogData.map(async (item) => {
      const changelog = new Changelog({
        version: item.version,
        order: item.order,
        time: item.time,
        content: item.content
      });
      
      await changelog.save();
      console.log(`✅ 已上传版本: ${item.version}`);
    });
    
    await Promise.all(uploadPromises);
    
    console.log('🎉 所有changelog数据上传完成！');
    
    // 验证上传结果
    const count = await Changelog.countDocuments();
    console.log(`📊 数据库中共有 ${count} 个版本记录`);
    
    // 显示最新版本
    const latestVersion = await Changelog.findOne().sort({ order: -1 });
    if (latestVersion) {
      console.log(`📋 最新版本: ${latestVersion.version} (${latestVersion.time})`);
    }
    
  } catch (error) {
    console.error('❌ 上传失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行上传
uploadChangelog(); 