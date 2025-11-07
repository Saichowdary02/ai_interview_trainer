const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getAnswer,
  updateFeedback,
  getAnswersByInterview,
  deleteAnswer,
  getAverageScore
} = require('../controllers/answerController');

const router = express.Router();

// @desc    Get answer details
// @route   GET /api/answers/:answerId
// @access  Private
router.get('/:answerId', authMiddleware, getAnswer);

// @desc    Update answer feedback (for admin/teachers)
// @route   PUT /api/answers/:answerId/feedback
// @access  Private
router.put('/:answerId/feedback', authMiddleware, updateFeedback);

// @desc    Get answers for an interview
// @route   GET /api/answers/interview/:interviewId
// @access  Private
router.get('/interview/:interviewId', authMiddleware, getAnswersByInterview);

// @desc    Delete an answer
// @route   DELETE /api/answers/:answerId
// @access  Private
router.delete('/:answerId', authMiddleware, deleteAnswer);

// @desc    Get average score for an interview
// @route   GET /api/answers/interview/:interviewId/average-score
// @access  Private
router.get('/interview/:interviewId/average-score', authMiddleware, getAverageScore);

module.exports = router;
