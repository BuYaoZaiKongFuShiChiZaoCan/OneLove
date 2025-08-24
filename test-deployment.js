// 测试Netlify部署是否成功的脚本
const https = require('https');

const BASE_URL = 'https://yibiling.netlify.app';

console.log('🚀 开始测试Netlify部署状态...\n');

// 测试健康检查
async function testHealth() {
  console.log('🏥 测试健康检查...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    console.log('✅ 健康检查成功!');
    console.log('   状态:', response.status);
    console.log('   环境:', response.environment);
    console.log('   数据库:', response.database);
    return true;
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    return false;
  }
}

// 测试Changelog API
async function testChangelog() {
  console.log('\n📝 测试Changelog API...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/changelog?limit=3`);
    console.log('✅ Changelog API成功!');
    console.log('   数据条数:', response.data.length);
    return true;
  } catch (error) {
    console.error('❌ Changelog API失败:', error.message);
    return false;
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
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('请求超时 (15秒)'));
    });
  });
}

// 主测试函数
async function runTests() {
  console.log('⏳ 等待Netlify部署完成...\n');
  
  const healthSuccess = await testHealth();
  const changelogSuccess = await testChangelog();
  
  console.log('\n📊 测试结果汇总:');
  console.log('   健康检查:', healthSuccess ? '✅ 成功' : '❌ 失败');
  console.log('   Changelog:', changelogSuccess ? '✅ 成功' : '❌ 失败');
  
  if (healthSuccess && changelogSuccess) {
    console.log('\n🎉 恭喜！Netlify部署成功，API正常工作！');
    console.log('🌐 你的网站: https://yibiling.netlify.app');
    console.log('💡 现在可以测试登录功能了');
  } else {
    console.log('\n⚠️ 部分API测试失败，可能还在部署中...');
    console.log('💡 建议等待几分钟后再次测试');
    console.log('🔍 或者检查Netlify Dashboard中的部署状态');
  }
}

// 运行测试
runTests().catch(console.error);
