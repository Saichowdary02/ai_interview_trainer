const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/userController');

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private
router.get('/', authMiddleware, getAllUsers);

// @desc    Delete a user account
// @route   DELETE /api/users/:userId
// @access  Private
router.delete('/:userId', authMiddleware, deleteUser);

module.exports = router;
