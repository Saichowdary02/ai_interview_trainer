const express = require('express');
const router = express.Router();
const {
  startQuiz,
  submitAnswer,
  finishQuiz,
  getUserQuizzes,
  getQuizResults,
  validateQuizStart,
  validateAnswer
} = require('../controllers/quizController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply auth middleware to all quiz routes
router.use(authMiddleware);

// POST /api/quizzes/start - Start a new quiz
router.post('/start', validateQuizStart, startQuiz);

// POST /api/quizzes/:quizId/answer - Submit answer for a question
router.post('/:quizId/answer', validateAnswer, submitAnswer);

// POST /api/quizzes/:quizId/finish - Finish quiz and get results
router.post('/:quizId/finish', finishQuiz);

// GET /api/quizzes/user/:userId - Get quiz history for a user
router.get('/user/:userId', getUserQuizzes);

// GET /api/quizzes/:quizId/results - Get detailed results for a quiz
router.get('/:quizId/results', getQuizResults);

module.exports = router;
