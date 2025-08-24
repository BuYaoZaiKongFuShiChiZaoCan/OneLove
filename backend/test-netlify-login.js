const fetch = require('node-fetch').default;

async function testNetlifyLogin() {
  const testCases = [
    { username: 'AdminQi.', password: 'admin123', description: 'AdminQi. 用户' },
    { username: 'admin', password: 'admin123', description: 'admin 用户' },
    { username: 'admin@qi.com', password: 'admin123', description: 'admin@qi.com 邮箱' }
  ];

  console.log('🔍 测试 Netlify Functions 登录功能...\n');

  for (const testCase of testCases) {
    console.log(`📝 测试: ${testCase.description}`);
    console.log(`   用户名: ${testCase.username}`);
    console.log(`   密码: ${testCase.password}`);

    try {
      const response = await fetch('https://yibiling.netlify.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: testCase.username,
          password: testCase.password
        })
      });

      console.log(`   状态码: ${response.status}`);
      
      const data = await response.json();
      console.log(`   响应:`, data);

      if (data.success) {
        console.log(`   ✅ 登录成功！`);
      } else {
        console.log(`   ❌ 登录失败: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ 请求错误: ${error.message}`);
    }

    console.log(''); // 空行分隔
  }

  // 测试健康检查
  console.log('🏥 测试健康检查...');
  try {
    const healthResponse = await fetch('https://yibiling.netlify.app/api/health');
    const healthData = await healthResponse.json();
    console.log('健康检查响应:', healthData);
  } catch (error) {
    console.log('健康检查错误:', error.message);
  }
}

testNetlifyLogin();
