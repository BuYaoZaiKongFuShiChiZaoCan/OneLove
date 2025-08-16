# 版本更新系统

## 自动版本管理

OneLove后端现在支持自动版本管理，版本号统一从 `package.json` 文件中读取。

## 如何更新版本号

### 1. 使用版本更新脚本（推荐）

```bash
# 更新到新版本
node update-version.js 5.0.5

# 示例输出
✅ 版本号已更新: 5.0.4 → 5.0.5
📝 请记得提交更改到Git
🚀 重启服务器后新版本号将生效
```

### 2. 手动更新

直接编辑 `package.json` 文件中的 `version` 字段：

```json
{
  "name": "onelove-backend",
  "version": "5.0.5",
  ...
}
```

## 版本号格式

使用语义化版本号格式：`x.y.z`

- `x`: 主版本号（重大更新）
- `y`: 次版本号（功能更新）
- `z`: 修订版本号（bug修复）

## 自动同步

更新 `package.json` 中的版本号后，以下接口会自动使用新版本号：

- `/api/info` - 服务信息
- `/api/auth` - 认证API信息  
- `/api/health` - 健康检查
- 启动日志

## 注意事项

1. 更新版本号后需要重启服务器才能生效
2. 记得提交版本号更改到Git
3. 建议在更新版本号的同时更新changelog记录

## 示例工作流程

```bash
# 1. 更新版本号
node update-version.js 5.0.5

# 2. 提交更改
git add package.json
git commit -m "v5.0.5: 更新版本号"

# 3. 重启服务器
npm restart
``` 