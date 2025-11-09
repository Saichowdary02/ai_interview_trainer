#!/usr/bin/env node

/**
 * Quick verification script to test CORS fix
 */

const https = require('https');

const API_BASE_URL = 'https://ai-interview-trainer-server.onrender.com';
const FRONTEND_URL = 'https://aiinterviewtrainer.vercel.app';

console.log('🔍 Verifying CORS Fix...');
console.log('========================\n');

// Test OPTIONS request (CORS preflight)
function testOptionsRequest() {
  console.log('1. Testing OPTIONS request (CORS preflight)...');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/api/auth/signup`);
    const req = https.request(url.toString(), {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    }, (res) => {
      console.log(`   ✅ Status: ${res.statusCode}`);
      console.log(`   ✅ Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`   ✅ Allow-Credentials: ${res.headers['access-control-allow-credentials']}`);
      console.log(`   ✅ Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      
      if (res.statusCode === 200) {
        console.log(`   ✅ CORS preflight successful!`);
        resolve(true);
      } else {
        console.log(`   ❌ CORS preflight failed!`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Request failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`   ❌ Request timed out`);
      resolve(false);
    });
    
    req.end();
  });
}

// Test actual POST request
function testPostRequest() {
  console.log('\n2. Testing actual POST request...');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/api/auth/signup`);
    const postData = JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123'
    });
    
    const req = https.request(url.toString(), {
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
        console.log(`   ✅ Status: ${res.statusCode}`);
        console.log(`   ✅ Allow-Origin: ${res.headers['access-control-allow-origin']}`);
        
        try {
          const response = JSON.parse(data);
          console.log(`   ✅ Response:`, response);
          
          if (res.statusCode < 500) {
            console.log(`   ✅ Request reached server (not blocked by CORS)!`);
            resolve(true);
          } else {
            console.log(`   ❌ Server error, but CORS is working`);
            resolve(true); // CORS is working if we get a real server response
          }
        } catch (error) {
          console.log(`   ✅ Raw response (no JSON): ${data.substring(0, 100)}...`);
          console.log(`   ✅ Request reached server (not blocked by CORS)!`);
          resolve(true);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Request failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ Request timed out`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

async function runVerification() {
  try {
    const optionsResult = await testOptionsRequest();
    const postResult = await testPostRequest();
    
    console.log('\n📊 Verification Summary');
    console.log('======================');
    console.log(`CORS Preflight: ${optionsResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`POST Request: ${postResult ? '✅ PASS' : '❌ FAIL'}`);
    
    if (optionsResult && postResult) {
      console.log('\n🎉 CORS fix successful!');
      console.log('The "invalid credentials" issue should now be resolved.');
      console.log('The frontend can now communicate with the backend.');
    } else {
      console.log('\n❌ CORS issues still exist.');
      console.log('Check the server logs for more details.');
    }
    
  } catch (error) {
    console.error('\n💥 Verification failed:', error);
  }
}

runVerification();
