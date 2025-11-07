const UserModel = require('../models/userModel');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  try {
    // In a real app, you'd check if user is admin
    // For now, just return all users (excluding password hashes)
    const db = require('../db');
    const result = await db.query(`
      SELECT id, name, email, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        users: result.rows
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      details: error.message
    });
  }
};

// @desc    Delete a user account
// @route   DELETE /api/users/:userId
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Users can only delete their own account (unless admin)
    if (userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own account'
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await UserModel.delete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      details: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  deleteUser
};
