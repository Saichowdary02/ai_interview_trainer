// API Test utility to check backend connectivity
import axios from 'axios';

const API_BASE_URL = 'https://ai-interview-trainer-server.onrender.com/api';

const testAPI = {
  // Test basic connectivity
  async testHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 5000,
        headers: {
          'Origin': 'https://ai-interview-trainer-five.vercel.app'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Test auth endpoints
  async testAuthEndpoints() {
    try {
      // Test signup endpoint
      const signupResponse = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      }, {
        timeout: 10000
      });

      return { success: true, signup: signupResponse.data };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status };
    }
  },

  // Test login endpoint
  async testLogin() {
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'demo@example.com',
        password: 'demopassword123'
      }, {
        timeout: 10000
      });

      return { success: true, data: loginResponse.data };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status };
    }
  },

  // Test protected endpoint
  async testProtectedEndpoint(token) {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status };
    }
  }
};

export default testAPI;
