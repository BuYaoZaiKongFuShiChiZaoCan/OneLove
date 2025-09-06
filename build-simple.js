const fs = require('fs');
const path = require('path');

console.log('🔨 开始构建 Netlify Functions (简化版)...');

// 确保 netlify-functions 目录存在
const functionsDir = path.join(__dirname, 'backend', 'netlify-functions');
if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
    console.log('✅ 创建 netlify-functions 目录');
}

// 创建 package.json
const packageJson = {
    "name": "onelove-api-functions",
    "version": "1.0.0",
    "description": "OneLove API Functions for Netlify",
    "main": "api.js",
    "scripts": {
        "build": "echo 'Functions build completed'"
    },
    "dependencies": {
        "serverless-http": "^3.2.0",
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "mongoose": "^8.0.0",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2",
        "dotenv": "^16.3.1",
        "morgan": "^1.10.0",
        "helmet": "^7.1.0",
        "express-validator": "^7.0.1",
        "multer": "^1.4.5-lts.1"
    },
    "engines": {
        "node": ">=18.x"
    }
};

fs.writeFileSync(path.join(functionsDir, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('✅ 创建 package.json');

// 创建 api.js 入口文件
const apiContent = `// Netlify Functions 入口点
// 直接导出合并后的server.js的handler
module.exports = require('../server.js').handler;
`;
fs.writeFileSync(path.join(functionsDir, 'api.js'), apiContent);
console.log('✅ 创建 api.js 入口文件');

// 创建构建时间戳
const timestamp = new Date().toISOString();
fs.writeFileSync(path.join(functionsDir, 'build-timestamp.txt'), `Build time: ${timestamp}`);
console.log('✅ 创建构建时间戳文件');

console.log('🎉 Netlify Functions 构建完成！');
console.log(`📅 构建时间: ${timestamp}`);
