#!/usr/bin/env node

/**
 * Comprehensive test script for AI Interview Trainer backend and frontend connection
 * Tests API endpoints, authentication, and CORS configuration
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = 'https://ai-interview-trainer-server.onrender.com';
const FRONTEND_URL = 'https://aiinterviewtrainer.vercel.app';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

console.log('🔧 AI Interview Trainer Connection Test');
console.log('=====================================\n');

// Test 1: Health Check
async function testHealthCheck() {
  console.log('1. Testing Health Check Endpoint...');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/api/health`);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(url.toString(), (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log(`   ✅ Status: ${health.status}`);
          console.log(`   ✅ Message: ${health.message}`);
          console.log(`   ✅ Database: ${health.db}`);
          console.log(`   ✅ Timestamp: ${health.timestamp}`);
          resolve({ success: true, data: health });
        } catch (error) {
          console.log(`   ❌ Failed to parse health response: ${error.message}`);
          console.log(`   ❌ Raw response: ${data}`);
          resolve({ success: false, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Health check failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Health check timed out`);
      resolve({ success: false, error: 'timeout' });
    });
  });
}

// Test 2: CORS Headers Check
async function testCORSHeaders() {
  console.log('\n2. Testing CORS Headers...');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/api/health`);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url.toString(), {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    }, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      };
      
      console.log(`   ✅ Response status: ${res.statusCode}`);
      console.log(`   ✅ Allow Origin: ${corsHeaders['access-control-allow-origin']}`);
      console.log(`   ✅ Allow Credentials: ${corsHeaders['access-control-allow-credentials']}`);
      
      if (corsHeaders['access-control-allow-origin'] === FRONTEND_URL || 
          corsHeaders['access-control-allow-origin'] === '*') {
        console.log(`   ✅ CORS headers are properly configured`);
        resolve({ success: true, headers: corsHeaders });
      } else {
        console.log(`   ❌ CORS headers are not properly configured`);
        resolve({ success: false, headers: corsHeaders });
      }
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ CORS test failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`   ❌ CORS test timed out`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.end();
  });
}

// Test 3: Authentication Endpoints
async function testAuthEndpoints() {
  console.log('\n3. Testing Authentication Endpoints...');
  
  // Test signup endpoint
  const signupData = {
    name: 'Test User',
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  };
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/api/auth/signup`);
    const client = url.protocol === 'https:' ? https : http;
    
    const postData = JSON.stringify(signupData);
    
    const req = client.request(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Signup response status: ${res.statusCode}`);
        console.log(`   ✅ Response headers: ${JSON.stringify({
          'access-control-allow-origin': res.headers['access-control-allow-origin'],
          'content-type': res.headers['content-type']
        })}`);
        
        try {
          const response = JSON.parse(data);
          console.log(`   ✅ Signup response:`, response);
          
          if (res.statusCode === 201 || res.statusCode === 409) { // 409 = user already exists
            console.log(`   ✅ Signup endpoint is working`);
            resolve({ success: true, signupResponse: response });
          } else {
            console.log(`   ⚠️  Unexpected signup status: ${res.statusCode}`);
            resolve({ success: false, signupResponse: response });
          }
        } catch (error) {
          console.log(`   ⚠️  Could not parse signup response: ${data}`);
          if (res.statusCode === 409) {
            console.log(`   ✅ User already exists (expected)`);
            resolve({ success: true, message: 'User already exists' });
          } else {
            resolve({ success: false, error: error.message });
          }
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Signup test failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Signup test timed out`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 4: Login Test
async function testLogin() {
  console.log('\n4. Testing Login Endpoint...');
  
  const loginData = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  };
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/api/auth/login`);
    const client = url.protocol === 'https:' ? https : http;
    
    const postData = JSON.stringify(loginData);
    
    const req = client.request(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Login response status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          console.log(`   ✅ Login response:`, response);
          
          if (res.statusCode === 200) {
            if (response.token) {
              console.log(`   ✅ Login successful, token received`);
              resolve({ success: true, token: response.token, userData: response.user });
            } else {
              console.log(`   ❌ Login successful but no token received`);
              resolve({ success: false, message: 'No token in response' });
            }
          } else if (res.statusCode === 401) {
            console.log(`   ❌ Invalid credentials - this is the issue you're experiencing`);
            resolve({ success: false, message: 'Invalid credentials', response });
          } else {
            console.log(`   ⚠️  Unexpected login status: ${res.statusCode}`);
            resolve({ success: false, message: `Unexpected status: ${res.statusCode}`, response });
          }
        } catch (error) {
          console.log(`   ❌ Could not parse login response: ${data}`);
          resolve({ success: false, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Login test failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Login test timed out`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 5: Protected Endpoint Test
async function testProtectedEndpoint(token) {
  console.log('\n5. Testing Protected Endpoint (Dashboard)...');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/api/users/profile`);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': FRONTEND_URL
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Profile response status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          console.log(`   ✅ Profile response:`, response);
          
          if (res.statusCode === 200) {
            console.log(`   ✅ Protected endpoint accessible with token`);
            resolve({ success: true, profile: response });
          } else if (res.statusCode === 401) {
            console.log(`   ❌ Token authentication failed`);
            resolve({ success: false, message: 'Token authentication failed' });
          } else {
            console.log(`   ⚠️  Unexpected profile status: ${res.statusCode}`);
            resolve({ success: false, message: `Unexpected status: ${res.statusCode}` });
          }
        } catch (error) {
          console.log(`   ❌ Could not parse profile response: ${data}`);
          resolve({ success: false, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Profile test failed: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Profile test timed out`);
      resolve({ success: false, error: 'timeout' });
    });
  });
}

// Main test function
async function runTests() {
  try {
    // Run tests sequentially
    const healthResult = await testHealthCheck();
    const corsResult = await testCORSHeaders();
    const authResult = await testAuthEndpoints();
    const loginResult = await testLogin();
    
    let protectedResult = null;
    if (loginResult.success && loginResult.token) {
      protectedResult = await testProtectedEndpoint(loginResult.token);
    }
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('==============');
    console.log(`Health Check: ${healthResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`CORS Headers: ${corsResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Auth Endpoints: ${authResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Login: ${loginResult.success ? '✅ PASS' : '❌ FAIL'}`);
    if (protectedResult) {
      console.log(`Protected Endpoint: ${protectedResult.success ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    // Provide recommendations
    console.log('\n🔧 Recommendations');
    console.log('==================');
    if (!healthResult.success) {
      console.log('❌ API server is not responding. Check server status.');
    }
    if (!corsResult.success) {
      console.log('❌ CORS configuration needs attention. Check server logs.');
    }
    if (!authResult.success) {
      console.log('❌ Authentication endpoints are not working properly.');
    }
    if (!loginResult.success) {
      console.log('❌ Login is failing - this is likely the "invalid credentials" issue.');
      console.log('   Check:');
      console.log('   - User exists in database');
      console.log('   - Password is correct');
      console.log('   - JWT secret is consistent');
      console.log('   - Database connection is working');
    }
    if (loginResult.success && !protectedResult) {
      console.log('❌ Token authentication is failing for protected endpoints.');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Check server logs for authentication errors');
    console.log('2. Verify database connection and user data');
    console.log('3. Ensure JWT_SECRET is consistent across deployments');
    console.log('4. Test with a known working user account');
    
  } catch (error) {
    console.error('\n💥 Test script failed:', error);
  }
}

// Run the tests
runTests();
