# OneLove 后端系统

## 项目结构

```
backend/
├── netlify-functions/     # Netlify Functions (生产环境)
│   ├── api.js            # 主API文件
│   ├── package.json      # 函数依赖
│   └── node_modules/     # 函数依赖包
├── server.js             # 独立后端服务器 (开发环境)
├── models/               # 数据模型
├── routes/               # 路由文件
├── middleware/           # 中间件
├── config/               # 配置文件
├── utils/                # 工具函数
└── package.json          # 后端依赖
```

## 环境说明

### 1. Netlify Functions (生产环境)
- 位置：`backend/netlify-functions/`
- 用途：部署到 Netlify 的无服务器函数
- 特点：连接到真实的 MongoDB 数据库
- 配置：通过 `netlify.toml` 和环境变量配置

### 2. 独立后端服务器 (开发环境)
- 位置：`backend/server.js`
- 用途：本地开发和测试
- 特点：完整的 Express 服务器
- 配置：通过 `config.env` 配置

## 数据库连接

两个环境都连接到同一个 MongoDB 数据库：
```
mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/
```

## 部署流程

### 生产环境部署
1. 确保 `backend/netlify-functions/` 中的代码是最新的
2. 运行 `node deploy-production.js` 进行部署准备
3. 提交代码到 Git 仓库
4. 推送到 GitHub
5. Netlify 自动部署

### 开发环境运行
```bash
cd backend
npm install
npm start
```

## 环境变量

### Netlify 环境变量
- `JWT_SECRET`: JWT 密钥
- `MONGODB_URI`: MongoDB 连接字符串
- `CORS_ORIGIN`: 允许的跨域来源

### 本地开发环境变量
- 在 `config.env` 文件中配置

## API 端点

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取用户信息

### 数据相关
- `GET /api/health` - 健康检查
- `GET /api/timeline-data/:type` - 获取时间线数据
- `GET /api/changelog` - 获取更新日志

## 注意事项

1. **数据库连接**: 确保 MongoDB 连接字符串正确
2. **环境变量**: 生产环境必须配置正确的环境变量
3. **CORS**: 确保跨域配置正确
4. **依赖管理**: 两个环境使用相同的依赖版本
5. **数据一致性**: 两个环境操作同一个数据库，确保数据一致性