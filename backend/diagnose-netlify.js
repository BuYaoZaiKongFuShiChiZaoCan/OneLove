const fetch = require('node-fetch').default;

async function diagnoseNetlify() {
  console.log('🔍 诊断 Netlify Functions 状态...\n');

  // 1. 测试健康检查
  console.log('1️⃣ 测试健康检查...');
  try {
    const healthResponse = await fetch('https://yibiling.netlify.app/api/health');
    const healthData = await healthResponse.json();
    console.log('   状态码:', healthResponse.status);
    console.log('   响应:', JSON.stringify(healthData, null, 2));
    
    // 检查是否是最新版本
    if (healthData.message && healthData.message.includes('netlify-functions')) {
      console.log('   ✅ 使用最新版本的Netlify Functions');
    } else {
      console.log('   ⚠️ 可能使用旧版本的API');
    }
  } catch (error) {
    console.log('   ❌ 健康检查失败:', error.message);
  }

  console.log('');

  // 2. 测试数据库连接
  console.log('2️⃣ 测试数据库连接...');
  try {
    const dbResponse = await fetch('https://yibiling.netlify.app/api/health');
    const dbData = await dbResponse.json();
    
    if (dbData.database) {
      console.log('   数据库状态:', dbData.database);
      if (dbData.database === 'connected') {
        console.log('   ✅ 数据库连接正常');
      } else {
        console.log('   ❌ 数据库连接失败');
      }
    }
    
    if (dbData.env_vars) {
      console.log('   环境变量状态:', dbData.env_vars);
    }
  } catch (error) {
    console.log('   ❌ 数据库检查失败:', error.message);
  }

  console.log('');

  // 3. 测试登录功能
  console.log('3️⃣ 测试登录功能...');
  const testUsers = [
    { username: 'AdminQi.', password: 'admin123' },
    { username: 'admin', password: 'admin123' }
  ];

  for (const user of testUsers) {
    console.log(`   测试用户: ${user.username}`);
    try {
      const loginResponse = await fetch('https://yibiling.netlify.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      const loginData = await loginResponse.json();
      console.log(`   状态码: ${loginResponse.status}`);
      console.log(`   响应: ${loginData.message}`);
      
      if (loginData.success) {
        console.log('   ✅ 登录成功');
      } else {
        console.log('   ❌ 登录失败');
      }
    } catch (error) {
      console.log('   ❌ 请求错误:', error.message);
    }
    console.log('');
  }

  // 4. 检查部署状态
  console.log('4️⃣ 检查部署状态...');
  try {
    const deployResponse = await fetch('https://yibiling.netlify.app/api/info');
    const deployData = await deployResponse.json();
    console.log('   API信息:', deployData.message);
    console.log('   版本:', deployData.version);
    console.log('   数据库状态:', deployData.database);
  } catch (error) {
    console.log('   ❌ 无法获取部署信息:', error.message);
  }

  console.log('\n📋 诊断完成');
}

diagnoseNetlify();
