# OneLove 项目部署脚本
# 部署时间: 2025/08/11 21:30:44

Write-Host "🚀 开始部署 OneLove 项目..." -ForegroundColor Green
Write-Host "部署时间: $(Get-Date -Format 'yyyy/MM/dd HH:mm:ss')" -ForegroundColor Yellow

# 检查Node.js和npm
Write-Host "📋 检查环境..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 请先安装 Node.js 和 npm" -ForegroundColor Red
    exit 1
}

# 检查Vercel CLI
Write-Host "📋 检查 Vercel CLI..." -ForegroundColor Cyan
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Vercel CLI 未安装，正在安装..." -ForegroundColor Yellow
    npm install -g vercel
}

# 安装依赖
Write-Host "📦 安装项目依赖..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

# 安装后端依赖
Write-Host "📦 安装后端依赖..." -ForegroundColor Cyan
cd OneLove-backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端依赖安装失败" -ForegroundColor Red
    exit 1
}
cd ..

# 创建部署包
Write-Host "📦 创建部署包..." -ForegroundColor Cyan
$deployDir = "deploy-package"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# 复制必要文件
Write-Host "📋 复制项目文件..." -ForegroundColor Cyan
Copy-Item "*.html" $deployDir
Copy-Item "*.json" $deployDir
Copy-Item "*.xml" $deployDir
Copy-Item "Pages" $deployDir -Recurse
Copy-Item "styles" $deployDir -Recurse
Copy-Item "images" $deployDir -Recurse
Copy-Item "font" $deployDir -Recurse
Copy-Item "webfonts" $deployDir -Recurse
Copy-Item "music" $deployDir -Recurse
Copy-Item "scripts" $deployDir -Recurse
Copy-Item "time" $deployDir -Recurse
Copy-Item "biJi" $deployDir -Recurse
Copy-Item "OneLove-backend" $deployDir -Recurse
Copy-Item "vercel.json" $deployDir

# 创建部署说明
$deployReadme = @"
# OneLove 项目部署包

## 部署信息
- 部署时间: $(Get-Date -Format 'yyyy/MM/dd HH:mm:ss')
- 项目版本: 5.0.1
- 部署平台: Vercel

## 快速部署

### 方法一：使用 Vercel CLI
1. 安装 Vercel CLI: \`npm install -g vercel\`
2. 登录 Vercel: \`vercel login\`
3. 部署项目: \`vercel --prod\`

### 方法二：使用 Vercel Dashboard
1. 访问 https://vercel.com
2. 导入 GitHub 仓库
3. 配置环境变量
4. 点击部署

## 环境变量配置
\`\`\`env
NODE_ENV=production
MONGODB_URI=mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/?retryWrites=true&w=majority&appName=OneLove
JWT_SECRET=OneLove_JWT_Secret_2024_Production_Key_For_Security
ENCRYPTION_KEY=OneLove_Encryption_Key_256_Bit_Production_2024
ENCRYPTION_IV=OneLove_IV_16_Bit
CORS_ORIGIN=https://your-domain.vercel.app
\`\`\`

## 项目结构
- \`index.html\`: 主页面
- \`Pages/\`: 页面文件
- \`OneLove-backend/\`: 后端代码
- \`vercel.json\`: Vercel配置

## 功能特性
- ✅ 用户认证系统
- ✅ 密码管理
- ✅ 数据导入导出
- ✅ 安全审计
- ✅ 响应式设计

## 技术支持
如有问题，请联系开发团队。
"@

$deployReadme | Out-File -FilePath "$deployDir/README.md" -Encoding UTF8

Write-Host "✅ 部署包创建完成: $deployDir" -ForegroundColor Green

# 部署到Vercel
Write-Host "🚀 开始部署到 Vercel..." -ForegroundColor Cyan
Write-Host "请选择部署方式:" -ForegroundColor Yellow
Write-Host "1. 自动部署 (需要已登录 Vercel)" -ForegroundColor White
Write-Host "2. 手动部署 (创建部署包)" -ForegroundColor White
Write-Host "3. 仅创建部署包" -ForegroundColor White

$choice = Read-Host "请选择 (1-3)"

switch ($choice) {
    "1" {
        Write-Host "🚀 自动部署到 Vercel..." -ForegroundColor Green
        vercel --prod
    }
    "2" {
        Write-Host "📋 准备手动部署..." -ForegroundColor Yellow
        Write-Host "部署包已创建在: $deployDir" -ForegroundColor Green
        Write-Host "请访问 https://vercel.com 进行手动部署" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "📦 部署包已创建在: $deployDir" -ForegroundColor Green
    }
    default {
        Write-Host "❌ 无效选择" -ForegroundColor Red
    }
}

Write-Host "🎉 部署流程完成!" -ForegroundColor Green
Write-Host "部署时间: $(Get-Date -Format 'yyyy/MM/dd HH:mm:ss')" -ForegroundColor Yellow 