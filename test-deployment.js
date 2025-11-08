#!/usr/bin/env node

/**
 * Test script to verify AI Interview Trainer deployment
 * Run this script to check if your deployment is working correctly
 */

const axios = require('axios');

const BACKEND_URL = 'https://ai-interview-trainer-server.onrender.com';
const FRONTEND_URL = 'https://ai-interview-trainer-five.vercel.app';

async function testDeployment() {
  console.log('🚀 Testing AI Interview Trainer Deployment...\n');

  // Test 1: Health Check
  console.log('1. Testing Backend Health Check...');
  try {
    const healthResponse = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Health Check Passed');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Message: ${healthResponse.data.message}`);
    console.log(`   Database: ${healthResponse.data.db}`);
  } catch (error) {
    console.log('❌ Health Check Failed');
    console.log(`   Error: ${error.message}`);
    return;
  }

  // Test 2: CORS Check
  console.log('\n2. Testing CORS Configuration...');
  try {
    const corsResponse = await axios.options(`${BACKEND_URL}/api/auth/login`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS Configuration Working');
  } catch (error) {
    console.log('⚠️  CORS Check - Check your FRONTEND_URL environment variable');
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Auth Endpoints
  console.log('\n3. Testing Authentication Endpoints...');
  
  // Test signup with demo data
  try {
    const signupResponse = await axios.post(`${BACKEND_URL}/api/auth/signup`, {
      name: 'Test User',
      email: 'test-deployment@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Signup Endpoint Working');
    console.log(`   Message: ${signupResponse.data.message}`);
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.error === 'Email already registered') {
      console.log('✅ Signup Endpoint Working (user already exists)');
    } else {
      console.log('❌ Signup Endpoint Failed');
      console.log(`   Error: ${error.message}`);
    }
  }

  // Test login with demo credentials
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'demo@example.com',
      password: 'demopassword123'
    });
    console.log('✅ Login Endpoint Working');
    console.log(`   Message: ${loginResponse.data.message}`);
    console.log(`   User: ${loginResponse.data.data.user.name}`);
  } catch (error) {
    console.log('⚠️  Login Endpoint - Demo user might not exist');
    console.log(`   Error: ${error.message}`);
  }

  // Test 4: Frontend Accessibility
  console.log('\n4. Testing Frontend Accessibility...');
  try {
    const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 10000 });
    console.log('✅ Frontend is Accessible');
    console.log(`   Status: ${frontendResponse.status}`);
  } catch (error) {
    console.log('⚠️  Frontend Accessibility Check');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n🎉 Deployment Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Set up proper environment variables on Render');
  console.log('2. Use demo credentials to test the application:');
  console.log('   Email: demo@example.com');
  console.log('   Password: demopassword123');
  console.log('3. Clear browser cache and try logging in');
}

// Run the test
testDeployment().catch(console.error);
