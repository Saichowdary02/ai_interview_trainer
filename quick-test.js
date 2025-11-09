#!/usr/bin/env node

/**
 * Quick test to verify the exact network error
 */

const https = require('https');

console.log('🔍 Quick Network Test');
console.log('====================\n');

// Test the exact URL your frontend is trying to reach
const API_BASE_URL = 'https://ai-interview-trainer-server.onrender.com/api';

function testHealthEndpoint() {
  console.log('Testing health endpoint...');
  
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE_URL}/health`);
    const req = https.request(url.toString(), {
      method: 'GET',
      headers: {
        'Origin': 'https://aiinterviewtrainer.vercel.app'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, {
          'access-control-allow-origin': res.headers['access-control-allow-origin'],
          'content-type': res.headers['content-type']
        });
        
        if (res.statusCode === 200) {
          try {
            const health = JSON.parse(data);
            console.log('✅ Backend is responding correctly!');
            console.log('Health check:', health);
            resolve(true);
          } catch (error) {
            console.log('✅ Backend responded but no JSON:', data.substring(0, 200));
            resolve(true);
          }
        } else {
          console.log(`❌ Backend returned status: ${res.statusCode}`);
          console.log('Response:', data.substring(0, 200));
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Network Error: ${error.message}`);
      console.log('This means the backend is not reachable at all');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('❌ Request timed out - backend not reachable');
      resolve(false);
    });
    
    req.end();
  });
}

async function runTest() {
  const result = await testHealthEndpoint();
  
  console.log('\n📋 Results Summary:');
  console.log('==================');
  
  if (result) {
    console.log('✅ Backend is working and reachable');
    console.log('✅ The issue is likely CORS or frontend configuration');
    console.log('💡 Solution: Set environment variables in Vercel correctly');
  } else {
    console.log('❌ Backend is not reachable');
    console.log('💡 Check: Backend deployment status on Render');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. If backend is working → Set REACT_APP_API_BASE_URL in Vercel');
  console.log('2. If backend is not working → Check Render deployment');
}

runTest();
