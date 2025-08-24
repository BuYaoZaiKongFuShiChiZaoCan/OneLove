#!/usr/bin/env node

const mongoose = require('mongoose');

// 数据库连接字符串
const MONGODB_URI = 'mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/onelove?retryWrites=true&w=majority&appName=OneLove';

async function checkDatabase() {
  console.log('🔍 检查数据库连接和集合信息...\n');
  
  try {
    // 连接数据库
    console.log('🔗 正在连接数据库...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ 数据库连接成功\n');
    
    // 获取数据库信息
    const db = mongoose.connection.db;
    console.log('📊 数据库信息:');
    console.log('数据库名称:', db.databaseName);
    console.log('');
    
    // 列出所有集合
    const collections = await db.listCollections().toArray();
    console.log('📁 所有集合:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    console.log('');
    
    // 检查users集合
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 users集合中的文档数量: ${userCount}\n`);
    
    if (userCount > 0) {
      console.log('📋 users集合中的用户:');
      const users = await usersCollection.find({}).limit(5).toArray();
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
      });
    }
    
    // 检查是否有其他用户相关的集合
    const userCollections = collections.filter(c => c.name.toLowerCase().includes('user'));
    if (userCollections.length > 0) {
      console.log('\n🔍 发现用户相关集合:');
      for (const collection of userCollections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`- ${collection.name}: ${count} 个文档`);
      }
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 运行检查
checkDatabase();
