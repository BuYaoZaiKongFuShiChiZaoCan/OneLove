const fs = require('fs');
const path = require('path');

// 获取命令行参数
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('请提供新版本号，例如: node update-version.js 5.0.4');
    process.exit(1);
}

// 验证版本号格式
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
    console.error('版本号格式错误，请使用 x.y.z 格式，例如: 5.0.4');
    process.exit(1);
}

try {
    // 读取package.json
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const oldVersion = packageJson.version;
    
    // 更新版本号
    packageJson.version = newVersion;
    
    // 写回package.json
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ 版本号已更新: ${oldVersion} → ${newVersion}`);
    console.log('📝 请记得提交更改到Git');
    console.log('🚀 重启服务器后新版本号将生效');
    
} catch (error) {
    console.error('更新版本号失败:', error);
    process.exit(1);
} 