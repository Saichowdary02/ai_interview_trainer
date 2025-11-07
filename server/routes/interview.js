const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  startInterview,
  getQuestions,
  submitAnswer,
  getResults,
  getHistory,
  setupInterview,
  getInterview,
  completeInterview,
  getExplanations
} = require('../controllers/interviewController');

const router = express.Router();

// @desc    Start a new interview session
// @route   POST /api/interview/start
// @access  Private
router.post('/start', authMiddleware, startInterview);

// @desc    Get questions for an interview
// @route   GET /api/interview/:interviewId/questions
// @access  Private
router.get('/:interviewId/questions', authMiddleware, getQuestions);

// @desc    Submit an answer and get AI feedback
// @route   POST /api/interview/:interviewId/submit-answer
// @access  Private
router.post('/:interviewId/submit-answer', authMiddleware, submitAnswer);

// @desc    Get interview results
// @route   GET /api/interview/:interviewId/results
// @access  Private
router.get('/:interviewId/results', authMiddleware, getResults);

// @desc    Get user's interview history
// @route   GET /api/interview/history
// @access  Private
router.get('/history', authMiddleware, getHistory);

// @desc    Setup enhanced interview with subject, question count, and time limits
// @route   POST /api/interview/setup
// @access  Private
router.post('/setup', authMiddleware, setupInterview);

// @desc    Get interview details with questions
// @route   GET /api/interview/:interviewId
// @access  Private
router.get('/:interviewId', authMiddleware, getInterview);

// @desc    Complete interview and get final results
// @route   POST /api/interview/:interviewId/complete
// @access  Private
router.post('/:interviewId/complete', authMiddleware, completeInterview);

// @desc    Get explanations for unanswered questions
// @route   GET /api/interview/:interviewId/explanations
// @access  Private
router.get('/:interviewId/explanations', authMiddleware, getExplanations);

module.exports = router;
