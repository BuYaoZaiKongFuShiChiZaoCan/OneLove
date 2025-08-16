# Railway 后端部署指南

## 概述
由于前端已部署到Netlify，我们需要将后端部署到Railway以提供API服务。Railway是一个简单易用的云平台，支持Node.js应用。

## 部署步骤

### 1. 准备Railway账户
1. 访问 [Railway官网](https://railway.app/)
2. 使用GitHub账户登录
3. 创建新项目

### 2. 准备后端代码
确保 `OneLove-backend` 目录包含以下文件：
- `package.json` - 项目依赖
- `server.js` - 主服务器文件
- `config.env` - 环境变量配置
- 其他必要的模型和中间件文件

### 3. 创建Railway配置文件
在 `OneLove-backend` 目录中创建 `railway.json`：

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. 部署到Railway
1. 在Railway控制台中点击 "Deploy from GitHub repo"
2. 选择您的GitHub仓库
3. 设置根目录为 `OneLove-backend`
4. 点击部署

### 5. 配置环境变量
在Railway项目设置中添加以下环境变量：
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
ENCRYPTION_IV=your_encryption_iv
CORS_ORIGIN=https://yibiling.netlify.app
```

### 6. 获取部署URL
部署完成后，Railway会提供一个HTTPS URL，类似：
`https://your-app-name.railway.app`

### 7. 更新前端配置
部署成功后，更新 `scripts/config.js` 中的生产环境配置：

```javascript
production: {
    apiBaseUrl: 'https://your-app-name.railway.app/api',
    corsOrigin: 'https://yibiling.netlify.app'
}
```

### 8. 测试部署
1. 访问您的Netlify网站
2. 尝试登录功能
3. 检查浏览器控制台是否有错误

## 故障排除

### 常见问题
1. **CORS错误**: 确保CORS_ORIGIN环境变量正确设置
2. **数据库连接失败**: 检查MONGODB_URI是否正确
3. **端口问题**: Railway会自动分配端口，无需手动配置

### 日志查看
在Railway控制台中查看部署日志，帮助诊断问题。

## 成本
Railway提供免费套餐，每月有使用限制。对于小型项目通常足够使用。

## 下一步
部署成功后，您的应用将完全在云端运行，可以从任何设备访问。 