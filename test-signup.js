const axios = require('axios');

// Test signup functionality
async function testSignup() {
  try {
    console.log('Testing signup functionality...');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123'
    };
    
    console.log('Sending signup request with data:', userData);
    
    const response = await axios.post('http://localhost:5000/api/auth/signup', userData);
    
    console.log('Success response:', response.data);
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

testSignup();
