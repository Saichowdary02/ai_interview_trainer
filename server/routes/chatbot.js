const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Chatbot routes
router.post('/send', chatbotController.sendMessage);
router.get('/test', chatbotController.testConnection);

module.exports = router;
