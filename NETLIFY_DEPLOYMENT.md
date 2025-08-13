# OneLove 项目 Netlify 部署指南

## 🚀 部署步骤

### 1. 前端部署（Netlify）

#### 方法一：通过GitHub连接部署
1. 访问 [Netlify官网](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 GitHub，授权访问您的仓库
4. 选择 `BuYaoZaiKongFuShiChiZaoCan/OneLove` 仓库
5. 配置部署设置：
   - **Build command**: 留空（静态站点）
   - **Publish directory**: `.` (根目录)
6. 点击 "Deploy site"

#### 方法二：直接拖拽部署
1. 将项目文件夹压缩为zip文件
2. 访问 [Netlify Drop](https://app.netlify.com/drop)
3. 拖拽zip文件到页面中
4. 等待自动部署完成

### 2. 后端部署（Railway推荐）

由于Netlify只支持静态文件，后端需要单独部署：

#### 使用Railway部署后端
1. 访问 [Railway官网](https://railway.app)
2. 使用GitHub账号登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择您的OneLove仓库
5. 配置部署设置：
   - **Root Directory**: `OneLove-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. 添加环境变量：
   ```
   MONGODB_URI=mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/?retryWrites=true&w=majority&appName=OneLove
   JWT_SECRET=OneLove_JWT_Secret_2024_Production_Key_For_Security
   ENCRYPTION_KEY=OneLove_Encryption_Key_256_Bit_Production_2024
   ENCRYPTION_IV=OneLove_IV_16_Bit
   ```

### 3. 配置API代理

部署完成后，需要更新 `netlify.toml` 中的后端URL：

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-railway-app-url.com/api/:splat"
  status = 200
  force = true
```

将 `your-railway-app-url.com` 替换为您的Railway应用URL。

### 4. 环境变量配置

在Netlify控制台中添加以下环境变量：
- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-netlify-site.netlify.app`

## 🔧 本地开发

### 启动前端（Netlify CLI）
```bash
npm install -g netlify-cli
netlify dev
```

### 启动后端
```bash
cd OneLove-backend
npm install
node server.js
```

## 📝 注意事项

1. **CORS配置**：确保后端允许Netlify域名的跨域请求
2. **环境变量**：所有敏感信息都通过环境变量配置
3. **数据库连接**：确保MongoDB Atlas允许Railway的IP访问
4. **文件大小**：Netlify有文件大小限制，确保静态资源合理

## 🌐 访问地址

- **前端**: `https://your-site-name.netlify.app`
- **后端**: `https://your-railway-app.railway.app`

## 🔄 自动部署

每次推送到GitHub main分支时，Netlify会自动重新部署前端。 