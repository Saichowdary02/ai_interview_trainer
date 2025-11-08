const axios = require('axios');

// Test configuration
const BASE_URL = 'https://ai-interview-trainer-server.onrender.com/api';
const TEST_TOKEN = 'your-jwt-token-here'; // Replace with a valid JWT token

async function testInterviewAPI() {
  console.log('🧪 Testing Interview API...\n');

  try {
    // Test 1: Setup Interview
    console.log('1. Testing setup interview endpoint...');
    const setupResponse = await axios.post(
      `${BASE_URL}/interview/setup`,
      {
        difficulty: 'easy',
        subject: 'java',
        questionCount: 5,
        timeLimit: 'nolimit',
        inputType: 'text'
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Setup Interview Response:');
    console.log(JSON.stringify(setupResponse.data, null, 2));
    
    if (setupResponse.data.success && setupResponse.data.data.interviewId) {
      const interviewId = setupResponse.data.data.interviewId;
      console.log(`\n📝 Interview ID: ${interviewId}`);
      
      // Test 2: Get Interview Details
      console.log('\n2. Testing get interview details...');
      const getResponse = await axios.get(
        `${BASE_URL}/interview/${interviewId}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      
      console.log('✅ Get Interview Response:');
      console.log(JSON.stringify(getResponse.data, null, 2));
      
      // Test 3: Check if questions were retrieved
      if (getResponse.data.data.questions && getResponse.data.data.questions.length > 0) {
        console.log(`\n🎯 Questions retrieved: ${getResponse.data.data.questions.length}`);
        getResponse.data.data.questions.forEach((q, i) => {
          console.log(`   ${i + 1}. ${q.content.substring(0, 100)}...`);
        });
      } else {
        console.log('\n❌ No questions found in the interview');
      }
    } else {
      console.log('\n❌ Interview setup failed');
    }

  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test database connectivity
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Database connection test:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Database connection failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
async function runTests() {
  await testDatabaseConnection();
  console.log('\n' + '='.repeat(60) + '\n');
  await testInterviewAPI();
}

runTests();
