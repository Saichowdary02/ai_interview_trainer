const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/authController');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', authMiddleware, getProfile);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', authMiddleware, updateProfile);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
