// 测试Netlify Functions API的脚本
const https = require('https');

const BASE_URL = 'https://yibiling.netlify.app';

// 测试健康检查
async function testHealthCheck() {
  console.log('🏥 测试健康检查...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    console.log('✅ 健康检查成功:', response);
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
  }
}

// 测试Changelog API
async function testChangelog() {
  console.log('📝 测试Changelog API...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/changelog?limit=5`);
    console.log('✅ Changelog API成功:', response);
  } catch (error) {
    console.error('❌ Changelog API失败:', error.message);
  }
}

// 测试用户角色检查 (需要token)
async function testUserRole() {
  console.log('👤 测试用户角色检查...');
  try {
    // 这里需要一个有效的token，暂时跳过
    console.log('⚠️ 用户角色检查需要有效token，跳过测试');
  } catch (error) {
    console.error('❌ 用户角色检查失败:', error.message);
  }
}

// 测试Timeline数据API (需要token)
async function testTimelineData() {
  console.log('📊 测试Timeline数据API...');
  try {
    // 这里需要一个有效的token，暂时跳过
    console.log('⚠️ Timeline数据API需要有效token，跳过测试');
  } catch (error) {
    console.error('❌ Timeline数据API失败:', error.message);
  }
}

// 通用HTTP请求函数
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试Netlify Functions API...\n');
  
  await testHealthCheck();
  console.log('');
  
  await testChangelog();
  console.log('');
  
  await testUserRole();
  console.log('');
  
  await testTimelineData();
  console.log('');
  
  console.log('🎉 测试完成！');
  console.log('💡 提示: 如果某些API测试失败，请检查：');
  console.log('   1. Netlify Functions是否正确部署');
  console.log('   2. 环境变量是否正确设置');
  console.log('   3. MongoDB连接是否正常');
}

// 运行测试
runTests().catch(console.error);
