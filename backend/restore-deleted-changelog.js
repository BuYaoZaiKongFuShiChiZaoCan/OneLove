// 数据恢复脚本 - 恢复被删除的changelog版本
const mongoose = require('mongoose');
const Changelog = require('./onelove-backend/models/Changelog');

// 数据库连接配置
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/?retryWrites=true&w=majority&appName=OneLove';

// 被删除的数据
const deletedData = [
  {
    _id: '68a1bddb1c7dfd7cf49361d3',
    version: 'v5.0.5',
    order: 1755430363536,
    time: '2025-08-17 19:32:43',
    content: [
      {
        itemTime: '[2025/08/17 19:32:43]',
        itemContent: '实现changelog子条目编辑功能：为每个changelog版本中的子条目添加独立的编辑按钮，支持鼠标悬停显示编辑按钮，实现子条目的时间和内容编辑功能，提升版本管理的灵活性。',
        _id: '68a1bddb1c7dfd7cf49361d4'
      }
    ],
    createdAt: '2025-08-17T11:32:43.000Z',
    updatedAt: '2025-08-17T11:32:43.000Z',
    createdBy: '68a1879069cfaf155ed2826f',
    updatedBy: '68a1879069cfaf155ed2826f',
    __v: 1
  },
  {
    _id: '68a1701c056620d1d553aa51',
    version: 'v5.0.4',
    order: 58,
    time: '2025.08.16 18:00:00',
    content: [
      {
        itemTime: '[2025/08/16 20:30:00]',
        itemContent: "修复MongoDB连接配置：更新OneLove-backend/config.env文件中的MongoDB连接字符串，添加数据库名称'onelove'到连接URL中，确保数据库连接指向正确的数据库实例，解决可能的数据库连接问题。",
        _id: '68a1701c056620d1d553aa52'
      },
      {
        itemTime: '[2025/08/16 20:35:00]',
        itemContent: '完善changelog数据同步：创建sync-changelog.js脚本，实现本地changelog.js文件数据到云端数据库的自动同步功能，确保版本记录在云端和本地保持一致，支持批量数据迁移和更新。',
        _id: '68a1701c056620d1d553aa53'
      },
      {
        itemTime: '[2025/08/16 20:40:00]',
        itemContent: "优化服务器启动流程：修复server.js文件中缺少的服务器启动代码，添加完整的数据库连接检查和服务器监听逻辑，确保服务器能够正常启动并显示详细的启动信息，包括数据库状态、API文档地址等。",
        _id: '68a1701c056620d1d553aa54'
      },
      {
        itemTime: '[2025/08/16 20:45:00]',
        itemContent: '解决helmet中间件冲突：移除onelove-backend/server.js中未使用的helmet中间件导入，避免与Windows文件系统大小写不敏感导致的路径冲突问题，确保服务器能够正常启动而不会出现模块导入错误。',
        _id: '68a1701c056620d1d553aa55'
      },
      {
        itemTime: '[2025/08/16 20:50:00]',
        itemContent: '云端changelog数据修复：发现云端数据库中的changelog记录content字段被错误保存为字符串格式，创建数据修复脚本将本地changelog.js文件中的正确数据同步到云端，确保版本记录内容完整准确。',
        _id: '68a1701c056620d1d553aa56'
      },
      {
        itemTime: '[2025/08/16 20:55:00]',
        itemContent: '项目日志管理优化：实现本地changelog.js与云端数据库的双向同步机制，支持版本记录的批量更新和实时同步，提升项目开发记录的管理效率和准确性。',
        _id: '68a1701c056620d1d553aa57'
      },
      {
        itemTime: '[2025-08-17 10:17:19]',
        itemContent: '实现更新日志权限管理系统：为开发者和管理员用户添加更新日志管理权限，开发者可以添加、删除、管理所有版本和条目，管理员只能添加条目到现有版本，实现基于角色的访问控制。',
        _id: '68a1bc361c7dfd7cf4935a2a'
      },
      {
        itemTime: '[2025-08-17 10:18:04]',
        itemContent: '优化更新日志数据结构：将更新日志分为版本和条目两个层级，版本由开发者和管理员创建，条目由管理员添加到指定版本，每个条目自动生成精确到秒的时间戳。',
        _id: '68a1bc701c7dfd7cf49360a7'
      },
      {
        itemTime: '[2025-08-17 10:18:29]',
        itemContent: '修复更新日志API路由冲突：解决Express路由定义顺序问题，确保更具体的路由（如/api/changelog/:versionId/items）在通用路由（如/api/changelog/:id）之前定义，避免路由匹配冲突。',
        _id: '68a1bc661c7dfd7cf4935f5c'
      },
      {
        itemTime: '[2025-08-17 10:18:35]',
        itemContent: '完善前端更新日志管理界面：添加版本添加按钮和条目添加按钮，实现动态表单创建和提交功能，支持实时数据刷新和用户友好的操作反馈。',
        _id: '68a1bc5d1c7dfd7cf4935e11'
      },
      {
        itemTime: '[2025-08-17 10:19:11]',
        itemContent: '解决服务器路由注册问题：通过重新组织路由定义顺序，确保所有API端点正确注册，解决404错误问题，提升系统稳定性。',
        _id: '68a1bc521c7dfd7cf4935cc6'
      },
      {
        itemTime: '[2025-08-17 10:19:20]',
        itemContent: '优化用户权限验证机制：改进JWT令牌验证和角色检查逻辑，实现更精确的权限控制，确保不同角色用户只能执行其权限范围内的操作。',
        _id: '68a1bc461c7dfd7cf4935b7b'
      }
    ],
    createdAt: '2025-08-17T06:01:00.852Z',
    updatedAt: '2025-08-17T11:26:40.434Z',
    createdBy: '68a1879069cfaf155ed2826f',
    updatedBy: '68a1879069cfaf155ed2826f',
    __v: 12
  }
];

async function restoreDeletedChangelog() {
  try {
    console.log('🔗 正在连接数据库...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000
    });

    console.log('✅ 数据库连接成功');

    let restoredCount = 0;
    let skippedCount = 0;

    for (const data of deletedData) {
      try {
        // 直接创建新的changelog记录，不检查是否存在
        const changelog = new Changelog(data);
        await changelog.save();
        
        console.log(`✅ 成功恢复版本 ${data.version} (${data.content.length} 个条目)`);
        restoredCount++;
        
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  版本 ${data.version} 已存在，跳过恢复`);
          skippedCount++;
        } else {
          console.error(`❌ 恢复版本 ${data.version} 失败:`, error.message);
        }
      }
    }

    console.log('\n📊 恢复结果统计:');
    console.log(`✅ 成功恢复: ${restoredCount} 个版本`);
    console.log(`⚠️  跳过已存在: ${skippedCount} 个版本`);
    console.log(`📝 总计处理: ${deletedData.length} 个版本`);

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行恢复脚本
restoreDeletedChangelog();
