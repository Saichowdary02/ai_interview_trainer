const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chatbot controller functions
const chatbotController = {
  // Handle chatbot messages
  sendMessage: async (req, res) => {
    try {
      const { messages = [] } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: 'Messages array is required'
        });
      }

      // Prepare the messages array for OpenAI API - filter out timestamp properties
      const openaiMessages = [
        {
          role: 'system',
          content: 'You are an AI Interview Trainer assistant. Help users prepare for technical interviews by providing guidance, answering questions about interview processes, and offering tips for success. Be professional, knowledgeable, and encouraging.'
        },
        ...messages.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const botResponse = response.choices[0].message.content;

      res.json({
        reply: botResponse,
        success: true
      });

    } catch (error) {
      console.error('Chatbot error:', error);
      
      if (error.response?.status === 401) {
        return res.status(401).json({
          error: 'Invalid OpenAI API key'
        });
      }
      
      if (error.response?.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.'
        });
      }

      res.status(500).json({
        error: 'Failed to get response from AI. Please try again.'
      });
    }
  },

  // Test endpoint to verify OpenAI configuration
  testConnection: async (req, res) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Hello, test connection.'
          }
        ],
        temperature: 0.1,
        max_tokens: 50,
      });

      res.json({
        success: true,
        message: 'OpenAI connection successful',
        testResponse: response.choices[0].message.content
      });

    } catch (error) {
      console.error('OpenAI test failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to connect to OpenAI API',
        details: error.message
      });
    }
  }
};

module.exports = chatbotController;
