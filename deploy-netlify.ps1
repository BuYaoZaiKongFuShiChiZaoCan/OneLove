# OneLove 项目 Netlify 部署脚本
# 部署时间: 2025/08/13 01:00:00

Write-Host "🚀 开始部署 OneLove 项目到 Netlify..." -ForegroundColor Green

# 检查是否安装了Netlify CLI
Write-Host "📋 检查 Netlify CLI..." -ForegroundColor Yellow
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI 已安装: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI 未安装，正在安装..." -ForegroundColor Red
    npm install -g netlify-cli
    Write-Host "✅ Netlify CLI 安装完成" -ForegroundColor Green
}

# 检查Git状态
Write-Host "📋 检查 Git 状态..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ 发现未提交的更改，正在提交..." -ForegroundColor Yellow
    git add .
    git commit -m "v5.0.2: 准备Netlify部署"
    git push origin main
    Write-Host "✅ 代码已提交到GitHub" -ForegroundColor Green
} else {
    Write-Host "✅ 代码已是最新状态" -ForegroundColor Green
}

# 部署到Netlify
Write-Host "🚀 开始部署到 Netlify..." -ForegroundColor Green
Write-Host "📝 请按照以下步骤操作：" -ForegroundColor Cyan
Write-Host "1. 访问 https://netlify.com" -ForegroundColor White
Write-Host "2. 点击 'New site from Git'" -ForegroundColor White
Write-Host "3. 选择 GitHub，授权访问您的仓库" -ForegroundColor White
Write-Host "4. 选择 BuYaoZaiKongFuShiChiZaoCan/OneLove 仓库" -ForegroundColor White
Write-Host "5. 配置部署设置：" -ForegroundColor White
Write-Host "   - Build command: 留空（静态站点）" -ForegroundColor White
Write-Host "   - Publish directory: . (根目录)" -ForegroundColor White
Write-Host "6. 点击 'Deploy site'" -ForegroundColor White

Write-Host "🎉 部署完成后，您将获得一个 Netlify 域名" -ForegroundColor Green
Write-Host "📝 记得更新 scripts/config.js 中的后端API地址" -ForegroundColor Yellow 