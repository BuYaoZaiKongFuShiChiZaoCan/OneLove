// 部署Netlify Functions脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署OneLove到Netlify...');

try {
  // 1. 检查当前目录
  console.log('📁 当前工作目录:', process.cwd());
  
  // 2. 检查netlify.toml配置
  const netlifyConfig = path.join(process.cwd(), 'netlify.toml');
  if (fs.existsSync(netlifyConfig)) {
    console.log('✅ 找到netlify.toml配置文件');
  } else {
    console.log('❌ 未找到netlify.toml配置文件');
    process.exit(1);
  }

  // 3. 检查Netlify Functions目录
  const functionsDir = path.join(process.cwd(), 'backend', 'netlify-functions');
  if (fs.existsSync(functionsDir)) {
    console.log('✅ 找到Netlify Functions目录');
  } else {
    console.log('❌ 未找到Netlify Functions目录');
    process.exit(1);
  }

  // 4. 检查是否安装了netlify-cli
  try {
    execSync('netlify --version', { stdio: 'pipe' });
    console.log('✅ Netlify CLI已安装');
  } catch (error) {
    console.log('❌ Netlify CLI未安装，请先运行: npm install -g netlify-cli');
    process.exit(1);
  }

  // 5. 检查是否已登录Netlify
  try {
    execSync('netlify status', { stdio: 'pipe' });
    console.log('✅ 已登录Netlify');
  } catch (error) {
    console.log('❌ 未登录Netlify，请先运行: netlify login');
    process.exit(1);
  }

  // 6. 构建项目
  console.log('🔨 构建项目...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 项目构建完成');
  } catch (error) {
    console.log('❌ 项目构建失败');
    process.exit(1);
  }

  // 7. 部署到Netlify
  console.log('🚀 部署到Netlify...');
  try {
    execSync('netlify deploy --prod', { stdio: 'inherit' });
    console.log('✅ 部署完成！');
  } catch (error) {
    console.log('❌ 部署失败');
    process.exit(1);
  }

  console.log('🎉 OneLove已成功部署到Netlify！');
  console.log('🌐 访问地址: https://yibiling.netlify.app');

} catch (error) {
  console.error('❌ 部署过程中发生错误:', error.message);
  process.exit(1);
}
