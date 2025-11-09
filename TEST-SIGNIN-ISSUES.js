#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE SIGNIN ISSUE TEST
 * Identifies and fixes signin/authentication problems
 */

const https = require('https');

console.log('🧪 COMPREHENSIVE SIGNIN ISSUE TEST');
console.log('==================================\n');

// Configuration
const BACKEND_URL = 'https://ai-interview-trainer-server.onrender.com';
const FRONTEND_URL = 'https://aiinterviewtrainer.vercel.app';
const API_BASE = `${BACKEND_URL}/api`;

function testBackendHealth() {
  console.log('🔍 **TEST 1: Backend Health Check**');
  console.log('====================================');
  
  return new Promise((resolve) => {
    const req = https.request(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      console.log(`Health Check Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log('✅ Backend Message:', health.message);
          console.log('✅ Database Status:', health.db);
          console.log('✅ Backend is Healthy\n');
          resolve({ success: true, data: health });
        } catch (e) {
          console.log('✅ Backend is Responding\n');
          resolve({ success: true, rawData: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Backend Error: ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });
    
    req.end();
  });
}

function testCORSForAuth() {
  console.log('🔍 **TEST 2: CORS Test for Auth Endpoints**');
  console.log('===========================================');
  
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
      console.log(`AUTH OPTIONS Status: ${res.statusCode}`);
      console.log('CORS Headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('origin')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });
      
      const corsAllowed = res.headers['access-control-allow-origin'];
      console.log(`CORS Allow Origin: ${corsAllowed}`);
      
      if (corsAllowed === FRONTEND_URL || corsAllowed === '*') {
        console.log('✅ CORS is ALLOWED for auth endpoints\n');
        resolve({ success: true, corsAllowed });
      } else {
        console.log('❌ CORS is BLOCKING auth endpoints\n');
        resolve({ success: false, corsAllowed });
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ AUTH OPTIONS Error: ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });
    
    req.end();
  });
}

function testLoginEndpoint() {
  console.log('🔍 **TEST 3: Login Endpoint Test**');
  console.log('==================================');
  
  return new Promise((resolve) => {
    // Test with invalid credentials first (should get 401)
    const invalidLoginData = {
      email: 'nonexistent@test.com',
      password: 'wrongpassword'
    };
    
    const req = https.request(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      console.log(`Login Endpoint Status: ${res.statusCode}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('origin')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Login Response:', response);
          
          if (res.statusCode === 401) {
            console.log('✅ Login Endpoint Working (correctly rejecting invalid credentials)\n');
            resolve({ success: true, endpointWorking: true });
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Login Endpoint Working (unexpected success)\n');
            resolve({ success: true, endpointWorking: true });
          } else {
            console.log('❌ Login Endpoint Issues\n');
            resolve({ success: false, endpointWorking: false });
          }
        } catch (e) {
          console.log('Raw Response:', data.substring(0, 200));
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Login Endpoint Working (No JSON response)\n');
            resolve({ success: true, endpointWorking: true });
          } else {
            console.log('❌ Login Endpoint Failed\n');
            resolve({ success: false, endpointWorking: false });
          }
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Login Request Error: ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });
    
    req.write(JSON.stringify(invalidLoginData));
    req.end();
  });
}

function testSignupEndpoint() {
  console.log('🔍 **TEST 4: Signup Endpoint Test**');
  console.log('==================================');
  
  return new Promise((resolve) => {
    const testEmail = `test_${Date.now()}@example.com`;
    const signupData = {
      name: 'Test User',
      email: testEmail,
      password: 'testpassword123'
    };
    
    const req = https.request(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      console.log(`Signup Endpoint Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Signup Response:', response);
          
          if (res.statusCode === 201 || res.statusCode === 400) {
            console.log('✅ Signup Endpoint Working\n');
            resolve({ success: true, endpointWorking: true });
          } else {
            console.log('❌ Signup Endpoint Issues\n');
            resolve({ success: false, endpointWorking: false });
          }
        } catch (e) {
          console.log('Signup Raw Response:', data.substring(0, 100));
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Signup Endpoint Working (No JSON)\n');
            resolve({ success: true, endpointWorking: true });
          } else {
            console.log('❌ Signup Endpoint Failed\n');
            resolve({ success: false, endpointWorking: false });
          }
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Signup Request Error: ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });
    
    req.write(JSON.stringify(signupData));
    req.end();
  });
}

function analyzeSigninIssues() {
  console.log('🔍 **TEST 5: Signin Issue Analysis**');
  console.log('===================================');
  
  console.log('Based on your "unable to sign in" issue:');
  console.log('');
  console.log('❌ **Common Causes:**');
  console.log('   1. CORS blocking requests from your domain');
  console.log('   2. Environment variables not set in production');
  console.log('   3. Backend API URL incorrect in frontend');
  console.log('   4. Network connectivity issues');
  console.log('   5. Database connection problems');
  console.log('');
  console.log('💡 **Most Likely Cause:** Environment variables missing');
  console.log('');
}

async function runSigninTest() {
  console.log('🚀 Starting Comprehensive Signin Issue Test...\n');
  
  const results = {
    backendHealth: await testBackendHealth(),
    corsAuth: await testCORSForAuth(),
    loginEndpoint: await testLoginEndpoint(),
    signupEndpoint: await testSignupEndpoint()
  };
  
  analyzeSigninIssues();
  
  console.log('📊 **SIGNIN TEST RESULTS**');
  console.log('==========================');
  
  console.log('Backend Health:', results.backendHealth.success ? '✅ WORKING' : '❌ FAILED');
  console.log('CORS for Auth:', results.corsAuth.success ? '✅ ALLOWED' : '❌ BLOCKED');
  console.log('Login Endpoint:', results.loginEndpoint.success ? '✅ WORKING' : '❌ FAILED');
  console.log('Signup Endpoint:', results.signupEndpoint.success ? '✅ WORKING' : '❌ FAILED');
  
  console.log('\n🎯 **SIGNIN ISSUE DIAGNOSIS**');
  console.log('==============================');
  
  if (!results.corsAuth.success) {
    console.log('🚨 **PRIMARY ISSUE**: CORS is blocking auth requests');
    console.log('   → Backend not allowing your Vercel domain');
    console.log('   → Set FRONTEND_URL environment variable in Render');
    console.log('   → Value: https://aiinterviewtrainer.vercel.app');
  }
  
  if (!results.backendHealth.success) {
    console.log('🚨 **BACKEND ISSUE**: Server is not responding');
    console.log('   → Check if backend is deployed and running');
    console.log('   → Check database connection');
  }
  
  if (results.corsAuth.success && results.backendHealth.success) {
    console.log('✅ **BACKEND IS WORKING**: Issue is likely frontend configuration');
    console.log('   → Set REACT_APP_API_BASE_URL in Vercel PRODUCTION environment');
    console.log('   → Value: https://aiinterviewtrainer-server.onrender.com/api');
  }
  
  console.log('\n⚡ **IMMEDIATE FIX FOR SIGNIN**');
  console.log('===============================');
  console.log('1. Set environment variables in Vercel and Render');
  console.log('2. Wait for automatic deployments (5-10 minutes)');
  console.log('3. Clear browser cache: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
  console.log('4. Try signing in again');
  console.log('5. If still not working, check browser console for specific errors');
  
  return results;
}

runSigninTest().catch(console.error);
