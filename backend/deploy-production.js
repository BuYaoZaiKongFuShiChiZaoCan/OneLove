#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始部署 OneLove 到生产环境...');

// 检查必要文件
const requiredFiles = [
  'backend/netlify-functions/api.js',
  'backend/netlify-functions/package.json',
  'netlify.toml',
  'package.json'
];

console.log('📋 检查必要文件...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ 缺少必要文件: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

// 安装函数依赖
console.log('\n📦 安装 Netlify Functions 依赖...');
try {
  process.chdir('backend/netlify-functions');
  execSync('npm install --production', { stdio: 'inherit' });
  process.chdir('../..');
  console.log('✅ Functions 依赖安装完成');
} catch (error) {
  console.error('❌ Functions 依赖安装失败:', error.message);
  process.exit(1);
}

// 安装主项目依赖
console.log('\n📦 安装主项目依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 主项目依赖安装完成');
} catch (error) {
  console.error('❌ 主项目依赖安装失败:', error.message);
  process.exit(1);
}

// 构建项目
console.log('\n🔧 构建项目...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ 项目构建完成');
} catch (error) {
  console.error('❌ 项目构建失败:', error.message);
  process.exit(1);
}

console.log('\n🎉 部署准备完成！');
console.log('\n📝 下一步操作：');
console.log('1. 提交代码到 Git 仓库');
console.log('2. 推送到 GitHub');
console.log('3. 在 Netlify 中重新部署');
console.log('\n💡 提示：确保 Netlify 环境变量已正确配置');
console.log('   - JWT_SECRET');
console.log('   - MONGODB_URI');
console.log('   - CORS_ORIGIN');
