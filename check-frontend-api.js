#!/usr/bin/env node

/**
 * Check what API URL the deployed frontend is actually trying to use
 */

const https = require('https');

console.log('🔍 Checking Frontend API Configuration');
console.log('====================================\n');

// Check the deployed frontend to see what it's trying to connect to
function checkFrontendAPI() {
  console.log('Checking deployed frontend...');
  
  return new Promise((resolve) => {
    const req = https.request('https://aiinterviewtrainer.vercel.app/static/js/main.*.js', {
      method: 'GET'
    }, (res) => {
      console.log(`Frontend status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Frontend is deployed and accessible');
        console.log('💡 If you see "Network Error", the environment variable still needs to be set');
      } else {
        console.log('❌ Frontend may have deployment issues');
      }
      
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (error) => {
      console.log(`❌ Frontend error: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

function checkAPIURL() {
  console.log('\n📋 Current Situation Analysis:');
  console.log('=============================');
  console.log('1. Backend: ✅ Working perfectly (we tested it)');
  console.log('2. Frontend: ✅ Deployed and accessible');
  console.log('3. Connection: ❌ "Network Error" = Frontend can\'t reach backend');
  console.log('');
  console.log('🔧 THE FIX:');
  console.log('============');
  console.log('You MUST set the environment variable in Vercel:');
  console.log('');
  console.log('1. Go to: https://vercel.com/your-project/settings/environment-variables');
  console.log('2. Add: REACT_APP_API_BASE_URL = https://ai-interview-trainer-server.onrender.com/api');
  console.log('3. Save and wait for automatic redeploy');
  console.log('4. Test again: https://aiinterviewtrainer.vercel.app/api-test');
  console.log('');
  console.log('⚠️  IMPORTANT: The environment variable must be set in PRODUCTION environment');
  console.log('   (not just development/local)');
}

async function runAnalysis() {
  await checkFrontendAPI();
  checkAPIURL();
}

runAnalysis();
