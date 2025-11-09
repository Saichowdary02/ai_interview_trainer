#!/usr/bin/env node

/**
 * 🧪 CHECK RENDER ENVIRONMENT VARIABLES
 * Tests what environment variables are actually set in your deployment
 */

const https = require('https');

console.log('🧪 CHECK RENDER ENVIRONMENT VARIABLES');
console.log('====================================\n');

// Configuration
const BACKEND_URL = 'https://ai-interview-trainer-server.onrender.com';
const FRONTEND_URL = 'https://aiinterviewtrainer.vercel.app';
const API_BASE = `${BACKEND_URL}/api`;

function testCORSWithLogging() {
  console.log('🔍 **TEST: CORS with Detailed Logging**');
  console.log('======================================');
  
  return new Promise((resolve) => {
    const req = https.request(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      console.log(`Health Check Status: ${res.statusCode}`);
      console.log('Response Headers:');
      
      // Check CORS headers
      const corsHeaders = {};
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('origin')) {
          corsHeaders[key] = res.headers[key];
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });
      
      console.log('\nAll Response Headers:');
      Object.keys(res.headers).forEach(key => {
        console.log(`  ${key}: ${res.headers[key]}`);
      });
      
      const corsAllowed = corsHeaders['access-control-allow-origin'] || corsHeaders['Access-Control-Allow-Origin'];
      console.log(`\nCORS Allow Origin: ${corsAllowed}`);
      
      // Test what the server thinks the allowed origin should be
      console.log('\n🔍 **CORS Analysis:**');
      console.log(`Requested Origin: ${FRONTEND_URL}`);
      console.log(`CORS Allow Origin Header: ${corsAllowed}`);
      
      if (corsAllowed === FRONTEND_URL || corsAllowed === '*') {
        console.log('✅ CORS is ALLOWED - Environment variable is working');
        resolve({ success: true, corsWorking: true });
      } else {
        console.log('❌ CORS is BLOCKED - Environment variable may not be set correctly');
        resolve({ success: false, corsWorking: false });
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.end();
  });
}

function testOptionsRequest() {
  console.log('\n🔍 **TEST: OPTIONS Request Analysis**');
  console.log('====================================');
  
  return new Promise((resolve) => {
    const req = https.request(`${API_BASE}/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      console.log(`OPTIONS Status: ${res.statusCode}`);
      console.log('OPTIONS Response Headers:');
      
      Object.keys(res.headers).forEach(key => {
        console.log(`  ${key}: ${res.headers[key]}`);
      });
      
      const corsAllowed = res.headers['access-control-allow-origin'];
      console.log(`\nCORS Allow Origin in OPTIONS: ${corsAllowed}`);
      
      if (corsAllowed === FRONTEND_URL || corsAllowed === '*') {
        console.log('✅ OPTIONS CORS is ALLOWED');
        resolve({ success: true, optionsWorking: true });
      } else {
        console.log('❌ OPTIONS CORS is BLOCKED');
        resolve({ success: false, optionsWorking: false });
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ OPTIONS Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.end();
  });
}

function checkEnvironmentVariable() {
  console.log('\n🔍 **TEST: Environment Variable Check**');
  console.log('=======================================');
  console.log('Based on our CORS test results:');
  console.log('');
  
  if (process.env.FRONTEND_URL) {
    console.log('✅ FRONTEND_URL environment variable is set locally');
    console.log(`   Value: ${process.env.FRONTEND_URL}`);
  } else {
    console.log('❌ FRONTEND_URL environment variable is NOT set locally');
  }
  
  console.log('\n📋 **To verify Render environment variables:**');
  console.log('1. Go to: https://dashboard.render.com');
  console.log('2. Find your service: "ai-interview-trainer-server"');
  console.log('3. Go to Settings → Environment');
  console.log('4. Look for variable named "FRONTEND_URL"');
  console.log('5. Check if value is: "https://aiinterviewtrainer.vercel.app"');
  console.log('6. If not found, add it and redeploy');
  console.log('');
  console.log('📋 **To verify Vercel environment variables:**');
  console.log('1. Go to: https://vercel.com/dashboard');
  console.log('2. Click project: "ai-interview-trainer"');
  console.log('3. Settings → Environment Variables');
  console.log('4. Look for "REACT_APP_API_BASE_URL" in PRODUCTION environment');
  console.log('5. Check if value is: "https://aiinterviewtrainer-server.onrender.com/api"');
}

async function runEnvironmentCheck() {
  console.log('🚀 Starting Environment Variable Check...\n');
  
  const results = {
    corsTest: await testCORSWithLogging(),
    optionsTest: await testOptionsRequest()
  };
  
  checkEnvironmentVariable();
  
  console.log('\n📊 **ENVIRONMENT CHECK RESULTS**');
  console.log('==================================');
  
  console.log('CORS Test:', results.corsTest.success && results.corsTest.corsWorking ? '✅ WORKING' : '❌ FAILED');
  console.log('OPTIONS Test:', results.optionsTest.success && results.optionsTest.optionsWorking ? '✅ WORKING' : '❌ FAILED');
  
  console.log('\n🎯 **DIAGNOSIS**');
  console.log('===============');
  
  if (!results.corsTest.corsWorking || !results.optionsTest.optionsWorking) {
    console.log('🚨 Environment variable FRONTEND_URL is not set correctly in Render');
    console.log('   OR the deployment hasn\'t picked up the environment variable yet');
    console.log('   → Check Render dashboard for environment variables');
    console.log('   → Make sure to redeploy after adding/modifying env vars');
  } else {
    console.log('✅ CORS is working - environment variables are set correctly');
    console.log('   → Issue might be elsewhere (check browser console for specific errors)');
  }
  
  return results;
}

runEnvironmentCheck().catch(console.error);
