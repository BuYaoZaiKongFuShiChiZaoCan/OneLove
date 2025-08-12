// 诊断认证和权限验证问题
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 配置
const JWT_SECRET = 'OneLove_JWT_Secret_2024_Production_Key_For_Security';
const mongoURI = 'mongodb+srv://OneLoveAdminQi:LG.2457_AtlasQiAdminOneLove@onelove.bepz2u0.mongodb.net/?retryWrites=true&w=majority&appName=OneLove';

// 模拟requireAdmin中间件
async function testRequireAdmin(token) {
  try {
    console.log('🔍 开始测试requireAdmin中间件...');
    
    // 1. 检查token是否存在
    if (!token) {
      console.log('❌ Token不存在');
      return { success: false, message: '访问令牌缺失' };
    }
    
    console.log('✅ Token存在，长度:', token.length);
    
    // 2. 验证JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ JWT验证成功');
      console.log('📋 解码后的数据:', decoded);
    } catch (jwtError) {
      console.log('❌ JWT验证失败:', jwtError.message);
      return { success: false, message: 'JWT验证失败' };
    }
    
    // 3. 连接数据库
    console.log('🔗 连接数据库...');
    await mongoose.connect(mongoURI);
    console.log('✅ 数据库连接成功');
    
    // 4. 查找用户
    const User = require('./OneLove-backend/models/User');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ 用户不存在');
      return { success: false, message: '用户不存在' };
    }
    
    console.log('✅ 用户找到:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    
    // 5. 检查用户状态
    if (!user.isActive) {
      console.log('❌ 用户账户被禁用');
      return { success: false, message: '用户账户被禁用' };
    }
    
    // 6. 检查管理员权限
    if (user.role !== 'admin') {
      console.log('❌ 用户不是管理员，角色:', user.role);
      return { success: false, message: '需要管理员权限' };
    }
    
    console.log('✅ 权限验证成功！');
    return { success: true, user: user };
    
  } catch (error) {
    console.log('❌ 权限验证过程中出错:', error.message);
    console.log('📋 错误详情:', error);
    return { success: false, message: '权限验证失败' };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 测试函数
async function runTest() {
  console.log('🚀 开始诊断认证问题...\n');
  
  // 这里需要您提供实际的token
  console.log('请提供您的JWT Token进行测试');
  console.log('您可以从浏览器控制台获取: localStorage.getItem("authToken")');
  
  // 示例token（请替换为实际token）
  const sampleToken = 'YOUR_ACTUAL_TOKEN_HERE';
  
  if (sampleToken === 'YOUR_ACTUAL_TOKEN_HERE') {
    console.log('⚠️ 请先替换脚本中的token');
    return;
  }
  
  const result = await testRequireAdmin(sampleToken);
  console.log('\n📊 测试结果:', result);
}

// 运行测试
runTest(); 