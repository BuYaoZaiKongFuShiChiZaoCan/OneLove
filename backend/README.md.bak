# OneLove 后端服务 - 教学版本

## 📚 项目说明

这是一个为初学者设计的Node.js后端项目，包含了详细的注释和说明，帮助您理解后端开发的基本概念。

## 🏗️ 项目结构

```
OneLove-backend/
├── server.js          # 主服务器文件
├── package.json       # 项目配置文件
├── Procfile          # Heroku部署配置
└── README.md         # 项目说明文档
```

## 🚀 快速开始

### 1. 安装依赖
```bash
cd OneLove-backend
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 启动生产服务器
```bash
npm start
```

## 📖 核心概念解释

### package.json 文件
- **作用**: Node.js项目的配置文件，相当于项目的"身份证"
- **主要字段**:
  - `name`: 项目名称
  - `version`: 版本号
  - `scripts`: 可执行的命令
  - `dependencies`: 生产环境依赖
  - `devDependencies`: 开发环境依赖

### server.js 文件
- **作用**: 主服务器文件，处理所有HTTP请求
- **核心概念**:
  - **中间件**: 处理请求的软件组件
  - **路由**: 定义URL路径和对应的处理函数
  - **API**: 应用程序接口，供前端调用

### Procfile 文件
- **作用**: 告诉Heroku如何启动您的应用
- **内容**: `web: node server.js` 表示启动web进程运行server.js

## 🔧 API接口说明

### 基础接口
- `GET /` - 欢迎页面
- `GET /api/health` - 健康检查

### 用户接口
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取特定用户

### 数据接口
- `GET /api/data` - 获取示例数据

## 🌐 部署到Heroku

### 1. 安装Heroku CLI
```bash
# 下载并安装Heroku CLI
# 访问: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. 登录Heroku
```bash
heroku login
```

### 3. 创建Heroku应用
```bash
heroku create your-app-name
```

### 4. 部署应用
```bash
git add .
git commit -m "Initial commit"
git push heroku main
```

### 5. 打开应用
```bash
heroku open
```

## 📝 学习要点

### 1. 中间件概念
中间件是Express框架的核心概念，它们按顺序执行：
```javascript
app.use(helmet());        // 安全中间件
app.use(cors());          // 跨域中间件
app.use(morgan());        // 日志中间件
```

### 2. 路由处理
路由定义了URL路径和对应的处理函数：
```javascript
app.get('/api/users', (req, res) => {
  // 处理GET请求
  res.json({ data: users });
});
```

### 3. 错误处理
Express使用中间件处理错误：
```javascript
app.use((err, req, res, next) => {
  // 处理错误
  res.status(500).json({ error: err.message });
});
```

## 🔍 调试技巧

### 1. 查看日志
```bash
# 本地开发
npm run dev

# Heroku日志
heroku logs --tail
```

### 2. 测试API
```bash
# 使用curl测试
curl http://localhost:3000/api/health

# 使用浏览器访问
http://localhost:3000/api/users
```

## 🎯 下一步学习

1. **数据库集成**: 学习如何连接数据库
2. **用户认证**: 实现登录注册功能
3. **文件上传**: 处理文件上传功能
4. **API文档**: 使用Swagger生成API文档
5. **测试**: 编写单元测试和集成测试

## 📞 获取帮助

如果遇到问题，可以：
1. 查看控制台错误信息
2. 检查网络连接
3. 确认端口是否被占用
4. 查看Heroku日志

---

**祝您学习愉快！** 🎉 