# OneLove Backend

这是OneLove项目的后端代码，包含所有服务器端逻辑和API。

## 📁 文件结构

```
backend/
├── netlify-functions/     # Netlify Functions (生产环境)
│   ├── api.js            # 主要的API函数
│   └── package.json      # Functions依赖
├── routes/               # Express路由
│   └── auth.js          # 认证相关路由
├── models/              # 数据模型
│   ├── User.js          # 用户模型
│   ├── Changelog.js     # 更新日志模型
│   └── TimelineData.js  # 时间线数据模型
├── middleware/          # 中间件
│   ├── auth.js          # 认证中间件
│   └── logger.js        # 日志中间件
├── config/              # 配置文件
│   └── database.js      # 数据库配置
├── utils/               # 工具函数
│   └── encryption.js    # 加密工具
├── server.js            # 主服务器文件
├── app.js               # Express应用
├── config.env           # 环境变量
├── package.json         # 依赖管理
├── start-local-server.js # 本地开发服务器
├── deploy-netlify.js    # Netlify部署脚本
├── check-database.js    # 数据库检查脚本
├── deploy-production.js # 生产环境部署脚本
└── README.md           # 本文件
```

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run start-local

# 或者启动生产模式服务器
npm start

# 开发模式（自动重启）
npm run dev
```

### 部署

```bash
# 部署到Netlify
npm run deploy

# 部署到生产环境
npm run deploy-prod
```

### 数据库操作

```bash
# 检查数据库连接
npm run check-db
```

## 🔧 环境变量

创建 `config.env` 文件并设置以下环境变量：

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your_encryption_key
ENCRYPTION_IV=your_encryption_iv
CORS_ORIGIN=https://your-domain.com
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret
LOG_LEVEL=info
```

## 📝 可用的登录账户

- **用户名**: `AdminQi.` (注意末尾的点)
- **密码**: `admin123`

- **用户名**: `admin`
- **密码**: `admin123`

- **邮箱**: `admin@qi.com`
- **密码**: `admin123`

## 🔗 API端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 健康检查
- `GET /api/health` - API健康状态

## 🛠️ 开发工具

### 本地测试服务器
`start-local-server.js` - 启动本地测试服务器，端口3001

### 部署脚本
- `deploy-netlify.js` - 部署到Netlify
- `deploy-production.js` - 部署到生产环境

### 数据库工具
- `check-database.js` - 检查数据库连接和用户数据

## 📊 监控和日志

- 使用Morgan进行HTTP请求日志记录
- 使用Helmet进行安全头设置
- 自定义日志中间件记录访问日志

## 🔒 安全特性

- JWT认证
- 密码加密（bcrypt）
- CORS配置
- 安全头设置
- 输入验证

## 📦 依赖

主要依赖包括：
- Express.js - Web框架
- Mongoose - MongoDB ODM
- bcryptjs - 密码加密
- jsonwebtoken - JWT认证
- express-validator - 输入验证
- cors - 跨域支持
- helmet - 安全头
- morgan - 日志记录
