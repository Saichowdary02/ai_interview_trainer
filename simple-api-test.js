const axios = require('axios');

// Simple API test to check if everything is working
async function simpleAPITest() {
  console.log('🚀 Simple API Test\n');
  
  const BASE_URL = 'https://ai-interview-trainer-server.onrender.com/api';
  
  try {
    // Test 1: Check if server is responding
    console.log('1. Testing server connectivity...');
    const response = await axios.get(`${BASE_URL}/questions?page=1&limit=5`);
    console.log('✅ Server is responding');
    console.log(`Status: ${response.status}`);
    console.log(`Questions found: ${response.data.data?.questions?.length || 0}`);
    
    // Test 2: Check questions in database
    if (response.data.data?.questions?.length > 0) {
      console.log('\n2. Sample questions from database:');
      response.data.data.questions.slice(0, 3).forEach((q, i) => {
        console.log(`   ${i + 1}. [${q.subject}] ${q.content.substring(0, 80)}...`);
      });
    }
    
    console.log('\n✅ API is working correctly!');
    console.log('💡 You can now try the interview setup from the frontend.');
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Message:', error.response.data?.error || error.response.statusText);
      
      if (error.response.status === 401) {
        console.log('\n🔐 Authentication required. Please log in first.');
      } else if (error.response.status === 500) {
        console.log('\n🔧 Server error. Check the backend logs.');
      }
    } else if (error.request) {
      console.error('Network error - server might be down');
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if you are logged in');
    console.log('2. Verify the server URL is correct');
    console.log('3. Check your internet connection');
    console.log('4. Try refreshing the page');
  }
}

simpleAPITest();
