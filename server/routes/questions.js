const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getAllQuestions,
  getQuestionsByDifficultyAndSubject,
  addQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

const router = express.Router();

/**
 * @desc    Get all questions (admin/testing)
 * @route   GET /api/questions
 * @access  Public
 */
router.get('/', getAllQuestions);

/**
 * @desc    Get questions by difficulty & subject (for interview generation)
 * @route   GET /api/questions/:subject/:difficulty?limit=10
 * @access  Public
 * Example: /api/questions/java/easy?limit=5
 */
router.get('/:subject/:difficulty', getQuestionsByDifficultyAndSubject);

/**
 * @desc    Add a new question (admin only)
 * @route   POST /api/questions
 * @access  Private
 */
router.post('/', authMiddleware, addQuestion);

/**
 * @desc    Update an existing question (admin only)
 * @route   PUT /api/questions/:questionId
 * @access  Private
 */
router.put('/:questionId', authMiddleware, updateQuestion);

/**
 * @desc    Delete a question (admin only)
 * @route   DELETE /api/questions/:questionId
 * @access  Private
 */
router.delete('/:questionId', authMiddleware, deleteQuestion);

module.exports = router;
