# OneLove 项目开发指南

## 🎯 项目概述

OneLove是一个个人数据管理平台，旨在将本地数据迁移到云端，实现多设备同步。项目包含用户认证、数据存储、版本管理等功能。

## 📚 学习目标

### 第一阶段：理解项目架构
- 分析现有前端代码结构
- 理解数据存储方式
- 确定需要云端化的功能模块

### 第二阶段：后端API开发
- 用户认证系统设计
- 数据库CRUD操作
- RESTful API接口设计

### 第三阶段：数据库设计
- 用户表设计
- 数据表设计
- 关系模型设计

### 第四阶段：前端改造
- 登录界面设计
- API调用集成
- 用户体验优化

### 第五阶段：部署上线
- 后端部署到Heroku
- 数据库配置
- 域名和SSL配置

## 🏗️ 技术架构

### 前端技术栈
```
OneLove/
├── index.html              # 主页面
├── Pages/                  # 页面文件夹
│   ├── login.html          # 登录页面 (新增)
│   ├── register.html       # 注册页面 (新增)
│   └── dashboard.html      # 用户中心 (新增)
├── styles/
│   ├── style.css           # 主样式
│   └── login.css           # 登录样式 (新增)
├── js/
│   ├── app.js              # 主逻辑
│   ├── auth.js             # 认证逻辑 (新增)
│   └── api.js              # API调用 (新增)
└── images/
```

**技术栈**:
- **HTML5**: 页面结构
- **CSS3**: 页面样式
- **JavaScript**: 交互逻辑
- **Bootstrap**: UI框架 (免费)

### 后端技术栈
```
OneLove-backend/
├── server.js               # 主服务器
├── package.json            # 项目配置
├── routes/
│   ├── auth.js             # 认证路由
│   ├── data.js             # 数据路由
│   └── changelog.js        # 更新日志路由
├── models/
│   ├── User.js             # 用户模型
│   ├── UserData.js         # 用户数据模型
│   └── Changelog.js        # 更新日志模型
├── middleware/
│   ├── auth.js             # 认证中间件
│   └── validation.js       # 数据验证
└── config/
    └── database.js         # 数据库配置
```

**技术栈**:
- **Node.js**: JavaScript运行环境
- **Express**: Web框架
- **MongoDB**: 数据库
- **Mongoose**: 数据库操作库
- **JWT**: 用户认证

### 部署技术栈
- **Heroku**: 后端部署 (免费)
- **MongoDB Atlas**: 云数据库 (免费)
- **GitHub Pages**: 前端部署 (免费)

## 📊 数据库设计

### 数据库: OneLove (MongoDB Atlas)

#### 集合1: users (用户表)
```javascript
{
  _id: ObjectId,           // 主键
  username: String,         // 用户名 (唯一，3-20字符)
  email: String,           // 邮箱 (唯一，小写)
  password: String,        // 密码哈希 (bcrypt加密)
  isActive: Boolean,       // 账户状态 (默认true)
  role: String,            // 用户角色 (user/admin，默认user)
  profile: {
    avatar: String,        // 头像URL (默认空字符串)
    bio: String,          // 个人简介 (最多200字符)
    phone: String         // 手机号 (格式验证)
  },
  lastLogin: Date,         // 最后登录时间
  createdAt: Date,        // 创建时间 (自动生成)
  updatedAt: Date         // 更新时间 (自动生成)
}
```

#### 集合2: passwords (密码数据表)
```javascript
{
  _id: ObjectId,           // 主键
  userId: ObjectId,        // 用户ID (关联users表)
  category: String,        // 密码类别 (如: x.com, QQ, 微信等)
  data: Mixed,             // 密码数据 (灵活存储，支持数组和对象)
  createdAt: Date,        // 创建时间 (自动生成)
  updatedAt: Date         // 更新时间 (自动生成)
}
```

#### 集合3: phones (手机数据表)
```javascript
{
  _id: ObjectId,           // 主键
  userId: ObjectId,        // 用户ID (关联users表)
  data: Mixed,             // 手机数据 (灵活存储，支持复杂对象结构)
  createdAt: Date,        // 创建时间 (自动生成)
  updatedAt: Date         // 更新时间 (自动生成)
}
```

### 数据库集合说明

| 集合名称 | 用途 | 记录数 | 状态 |
|---------|------|--------|------|
| `users` | 用户账户管理 | 2条 | ✅ 正常使用 |
| `passwords` | 密码数据存储 | 17条 | ✅ 正常使用 |
| `phones` | 手机数据存储 | 1条 | ✅ 正常使用 |

### 数据迁移状态
- ✅ 用户数据已迁移到云端
- ✅ 密码数据已迁移到云端 (17条记录)
- ✅ 手机数据已迁移到云端 (1条记录)
- ✅ 管理员账户已创建 (AdminQi.)
- ✅ 测试账户已创建 (testUser)

### 数据库连接信息
- **数据库**: MongoDB Atlas
- **连接字符串**: `mongodb+srv://OneLoveAdminQi:****@onelove.bepz2u0.mongodb.net/`
- **数据库名称**: OneLove
- **状态**: 正常运行

## 🚀 实施步骤

### 步骤1: 后端开发 ✅
- [x] 创建Express服务器
- [x] 设置MongoDB连接
- [x] 实现用户认证API
- [x] 实现数据CRUD API

### 步骤2: 前端改造 🔄
- [ ] 创建登录/注册页面
- [ ] 集成API调用
- [ ] 实现数据同步
- [ ] 优化用户体验

### 步骤3: 数据迁移 📊
- [ ] 分析现有本地数据
- [ ] 设计数据迁移脚本
- [ ] 执行数据迁移
- [ ] 验证数据完整性

### 步骤4: 部署上线 🌐
- [ ] 部署后端到Heroku
- [ ] 配置MongoDB Atlas
- [ ] 设置环境变量
- [ ] 测试线上功能

## 📖 核心概念

### 1. 用户认证流程
```
用户注册 → 密码加密 → 存储用户信息
用户登录 → 验证密码 → 生成JWT令牌
API调用 → 验证令牌 → 返回数据
```

### 2. 数据同步机制
```
本地数据 → 上传到云端 → 其他设备同步
云端数据 → 下载到本地 → 本地更新
冲突处理 → 时间戳比较 → 最新数据优先
```

### 3. 安全考虑
- 密码加密存储 (bcrypt)
- JWT令牌认证
- API访问控制
- 数据验证和清理

## 🎯 预期成果

### 功能特性
- ✅ 用户注册和登录
- ✅ 云端数据存储
- ✅ Changelog云端管理
- ✅ 多设备数据同步
- ✅ 用户权限管理

### 技术能力
- ✅ 全栈开发能力
- ✅ 数据库设计能力
- ✅ API设计能力
- ✅ 云服务部署能力
- ✅ 前后端分离开发

## 📅 学习时间安排

- **第1周**: 后端基础开发 ✅
- **第2周**: 前端界面改造 🔄
- **第3周**: 数据迁移和测试 📊
- **第4周**: 部署上线和优化 🌐

## 🔧 开发工具

### 免费工具
- **代码编辑器**: VS Code
- **版本控制**: Git + GitHub
- **后端部署**: Heroku (免费)
- **数据库**: MongoDB Atlas (免费)
- **前端部署**: GitHub Pages (免费)

### 学习资源
- **Node.js官方文档**
- **Express.js官方文档**
- **MongoDB官方文档**
- **MDN Web文档**

## 📝 API接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/password` - 修改密码
- `POST /api/auth/logout` - 用户登出

### 数据接口
- `GET /api/data` - 获取用户数据
- `POST /api/data` - 创建用户数据
- `PUT /api/data/:id` - 更新用户数据
- `DELETE /api/data/:id` - 删除用户数据

### 更新日志接口
- `GET /api/changelog` - 获取更新日志
- `POST /api/changelog` - 创建更新日志
- `PUT /api/changelog/:id` - 更新日志
- `DELETE /api/changelog/:id` - 删除日志

---

**项目开始时间**: 2025年8月1日  
**预计完成时间**: 2025年8月底  
**学习目标**: 掌握全栈开发，实现云端数据同步 