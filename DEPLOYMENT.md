# 🚀 OneLove 项目部署指南

**部署时间**: 2025/08/11 21:30:44  
**项目版本**: 5.0.1  
**部署平台**: Vercel

## 📋 **部署前准备**

### 1. 环境要求
- ✅ Node.js 18+ 
- ✅ npm 9+
- ✅ Git
- ✅ Vercel 账户

### 2. 检查项目状态
```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 检查项目依赖
npm list --depth=0
```

## 🚀 **快速部署**

### 方法一：使用部署脚本（推荐）

```powershell
# 运行部署脚本
.\deploy.ps1
```

### 方法二：手动部署

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 部署项目
```bash
vercel --prod
```

### 方法三：使用 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 配置环境变量
5. 点击 "Deploy"

## ⚙️ **环境变量配置**

在 Vercel Dashboard 中配置以下环境变量：

```env
# 基础配置
NODE_ENV=production
PORT=3000

# 数据库配置
MONGODB_URI=mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/?retryWrites=true&w=majority&appName=OneLove

# 安全配置
JWT_SECRET=OneLove_JWT_Secret_2024_Production_Key_For_Security
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=OneLove_Encryption_Key_256_Bit_Production_2024
ENCRYPTION_IV=OneLove_IV_16_Bit

# CORS配置
CORS_ORIGIN=https://your-domain.vercel.app

# 其他配置
BCRYPT_ROUNDS=12
SESSION_SECRET=OneLove_Session_Secret_Production_2024
LOG_LEVEL=info
BACKUP_RETENTION_DAYS=30
MAX_BACKUP_SIZE_MB=100
```

## 📁 **项目结构**

```
OneLove/
├── index.html              # 主页面
├── vercel.json             # Vercel配置
├── deploy.ps1              # 部署脚本
├── DEPLOYMENT.md           # 部署说明
├── Pages/                  # 页面文件
│   ├── login.html          # 登录页面
│   ├── admin/              # 管理后台
│   └── About/              # 项目信息
├── OneLove-backend/        # 后端代码
│   ├── server.js           # 主服务器
│   ├── config.env          # 环境配置
│   ├── models/             # 数据模型
│   ├── middleware/         # 中间件
│   └── utils/              # 工具函数
└── 静态资源目录/
    ├── styles/             # CSS样式
    ├── images/             # 图片资源
    ├── font/               # 字体文件
    ├── music/              # 音乐文件
    └── scripts/            # JavaScript文件
```

## 🔧 **部署配置**

### Vercel 配置 (vercel.json)
```json
{
  "version": 2,
  "name": "onelove-app",
  "builds": [
    {
      "src": "OneLove-backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "OneLove-backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## ✅ **部署验证**

### 1. 检查部署状态
```bash
# 查看部署日志
vercel logs

# 检查域名
vercel domains
```

### 2. 功能测试
- [ ] 主页访问正常
- [ ] 用户登录功能
- [ ] 密码管理功能
- [ ] 数据导入导出
- [ ] 管理后台访问
- [ ] 移动端适配

### 3. 性能检查
- [ ] 页面加载速度
- [ ] API响应时间
- [ ] 数据库连接
- [ ] 静态资源加载

## 🛠️ **故障排除**

### 常见问题

#### 1. 404 错误
```bash
# 检查路由配置
cat vercel.json

# 检查文件路径
ls -la
```

#### 2. 数据库连接失败
```bash
# 检查环境变量
echo $MONGODB_URI

# 检查网络连接
ping onelove.bepz2u0.mongodb.net
```

#### 3. CORS 错误
```bash
# 检查CORS配置
grep -r "cors" OneLove-backend/
```

#### 4. 静态资源加载失败
```bash
# 检查文件权限
ls -la styles/ images/ font/

# 检查文件路径
find . -name "*.css" -o -name "*.js"
```

## 📊 **监控和维护**

### 1. 性能监控
- Vercel Analytics
- MongoDB Atlas 监控
- 错误日志监控

### 2. 定期维护
- 数据库备份
- 依赖更新
- 安全补丁
- 性能优化

### 3. 备份策略
- 自动数据库备份
- 代码版本控制
- 配置文件备份

## 🔒 **安全配置**

### 1. 环境变量安全
- 使用强密码
- 定期轮换密钥
- 限制访问权限

### 2. 网络安全
- HTTPS 强制
- CSP 策略
- 请求限制

### 3. 数据安全
- 数据加密
- 访问日志
- 安全审计

## 📞 **技术支持**

### 联系方式
- 项目文档: [GitHub Wiki](https://github.com/your-repo/wiki)
- 问题反馈: [GitHub Issues](https://github.com/your-repo/issues)
- 技术支持: [Email Support](mailto:support@onelove.com)

### 紧急联系
- 服务器故障: 立即联系运维团队
- 数据丢失: 启动备份恢复流程
- 安全事件: 启动安全响应流程

---

**部署完成时间**: 2025/08/11 21:30:44  
**部署状态**: ✅ 准备就绪  
**下一步**: 运行部署脚本开始部署 