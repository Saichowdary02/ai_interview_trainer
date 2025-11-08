const axios = require('axios');

async function testBackendConnection() {
  const baseURL = 'https://ai-interview-trainer-server.onrender.com/api';
  
  console.log('🔍 Testing Backend Connection...\n');
  
  try {
    // Test 1: Basic health check without CORS
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`, {
      timeout: 10000,
      headers: {
        'Origin': 'https://ai-interview-trainer-five.vercel.app',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:');
    console.log('   Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    } else if (error.request) {
      console.log('   Request made but no response received');
    }
  }
  
  try {
    // Test 2: Try login endpoint
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'demo@example.com',
      password: 'demopassword123'
    }, {
      timeout: 10000,
      headers: {
        'Origin': 'https://ai-interview-trainer-five.vercel.app',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('✅ Login test passed:', loginResponse.data);
  } catch (error) {
    console.log('❌ Login test failed:');
    console.log('   Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
  
  try {
    // Test 3: Try signup endpoint
    console.log('\n3. Testing signup endpoint...');
    const signupResponse = await axios.post(`${baseURL}/auth/signup`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    }, {
      timeout: 10000,
      headers: {
        'Origin': 'https://ai-interview-trainer-five.vercel.app',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('✅ Signup test passed:', signupResponse.data);
  } catch (error) {
    console.log('❌ Signup test failed:');
    console.log('   Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
  
  console.log('\n🏁 Test completed!');
}

testBackendConnection().catch(console.error);
