#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 正确的数据库连接字符串
const MONGODB_URI = 'mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/onelove?retryWrites=true&w=majority&appName=OneLove';

async function testRealUsers() {
  console.log('🔍 测试真实用户的密码...\n');
  
  try {
    // 连接数据库
    console.log('🔗 正在连接onelove数据库...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ 数据库连接成功\n');
    
    // 获取所有用户
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log(`📊 找到 ${users.length} 个真实用户:\n`);
    
    // 测试常见密码
    const commonPasswords = [
      'admin123',
      "testUser",
    ];
    
    for (const user of users) {
      console.log(`👤 用户: ${user.username} (${user.email})`);
      console.log(`   角色: ${user.role}`);
      console.log(`   状态: ${user.isActive ? '活跃' : '禁用'}`);
      console.log(`   密码哈希: ${user.password.substring(0, 20)}...`);
      
      // 测试密码
      let foundPassword = null;
      for (const password of commonPasswords) {
        try {
          const isValid = await bcrypt.compare(password, user.password);
          if (isValid) {
            foundPassword = password;
            break;
          }
        } catch (error) {
          console.log(`   ❌ 密码验证错误: ${error.message}`);
        }
      }
      
      if (foundPassword) {
        console.log(`   ✅ 找到密码: ${foundPassword}`);
      } else {
        console.log(`   ❌ 未找到匹配的密码`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行测试
testRealUsers();
