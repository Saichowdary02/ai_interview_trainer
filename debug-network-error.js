#!/usr/bin/env node

/**
 * Debug the exact network error your frontend is experiencing
 */

const https = require('https');

console.log('🔍 Debugging Network Error');
console.log('==========================\n');

function testSpecificURLs() {
  const urls = [
    'https://ai-interview-trainer-server.onrender.com/api/health',
    'https://ai-interview-trainer-server.onrender.com/api/auth/signup',
    'https://ai-interview-trainer-server.onrender.com/api/auth/login'
  ];
  
  urls.forEach((url, index) => {
    console.log(`Testing URL ${index + 1}: ${url}`);
    
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'Origin': 'https://aiinterviewtrainer.vercel.app',
        'Content-Type': 'application/json'
      }
    }, (res) => {
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  CORS: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`  ✅ Working: ${data.substring(0, 100)}...`);
        } else {
          console.log(`  ❌ Error response: ${data.substring(0, 100)}...`);
        }
        console.log('');
      });
    });
    
    req.on('error', (error) => {
      console.log(`  ❌ Network Error: ${error.message}`);
      console.log('');
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`  ❌ Timeout: URL not reachable`);
      console.log('');
    });
    
    req.end();
  });
}

function checkFrontendBuild() {
  console.log('\n📋 Frontend Build Check:');
  console.log('========================');
  console.log('If you have environment variables set correctly, the issue might be:');
  console.log('');
  console.log('1. ❌ **Build didn\'t pick up environment variables**');
  console.log('   Solution: Trigger a new build/deploy in Vercel');
  console.log('');
  console.log('2. ❌ **Environment variable not in PRODUCTION environment**');
  console.log('   Solution: Make sure it\'s set for Production, not just Preview/Development');
  console.log('');
  console.log('3. ❌ **Frontend cached old version**');
  console.log('   Solution: Hard refresh (Ctrl+F5) or clear browser cache');
  console.log('');
  console.log('4. ❌ **Environment variable name mismatch**');
  console.log('   Solution: Must be exactly "REACT_APP_API_BASE_URL"');
  console.log('');
  console.log('🔧 **IMMEDIATE ACTIONS:**');
  console.log('1. Go to Vercel Dashboard → Your Project → Deployments');
  console.log('2. Click "Deploy" to trigger a fresh build');
  console.log('3. After deployment, do Ctrl+F5 on your frontend');
  console.log('4. Test again');
}

function analyzeError() {
  console.log('\n🚨 **CRITICAL ANALYSIS:**');
  console.log('=========================');
  console.log('Since you say environment variables are correct, we need to verify:');
  console.log('');
  console.log('1. **Are they set in PRODUCTION environment?** (not just preview)');
  console.log('2. **Did Vercel rebuild after adding them?**');
  console.log('3. **Is the variable name exact?** "REACT_APP_API_BASE_URL"');
  console.log('');
  console.log('💡 **QUICK TEST:**');
  console.log('Open browser dev tools → Network tab → Try login');
  console.log('Check what URL it\'s actually trying to connect to');
  console.log('If it\'s still the old URL, environment variables weren\'t applied');
}

// Run tests
testSpecificURLs();
setTimeout(() => {
  checkFrontendBuild();
  analyzeError();
}, 3000);
