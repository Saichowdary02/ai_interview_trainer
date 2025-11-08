const QuizModel = require('../models/quizModel');
const QuizAnswerModel = require('../models/quizAnswerModel');
const { validationResult, body } = require('express-validator');

const validateQuizStart = [
  body('userId').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  body('subject').isString().notEmpty(),
  body('difficulty').isIn(['easy', 'medium', 'difficult']),
  body('numQuestions').isInt({ min: 5, max: 15 }),
  body('timer').isIn([15, 30, 45, 60])
];

const validateAnswer = [
  body('questionId').isInt({ min: 1 }),
  body('selectedOption').isString().notEmpty()
];

// ✅ Start quiz
const startQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { userId, subject, difficulty, numQuestions, timer } = req.body;
    const quiz = await QuizModel.create(userId, subject, difficulty, numQuestions);

    const questions = await QuizModel.getQuestionsByDifficultyAndSubject(difficulty, subject, numQuestions);
    if (!questions.length) return res.status(404).json({ success: false, message: 'No questions found' });

    res.status(201).json({
      success: true,
      message: 'Quiz started successfully',
      data: { quiz, questions, timer }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to start quiz', error: err.message });
  }
};

// ✅ Submit answer
const submitAnswer = async (req, res) => {
  try {
    console.log('Submit answer request:', {
      params: req.params,
      body: req.body,
      quizId: req.params.quizId
    });

    const { quizId } = req.params;
    const { questionId, selectedOption } = req.body;

    console.log('Processing answer:', { quizId, questionId, selectedOption });

    // Validate inputs
    if (!quizId || !questionId || !selectedOption) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: quizId, questionId, or selectedOption' 
      });
    }

    const isCorrect = await QuizAnswerModel.checkAnswer(questionId, selectedOption);
    console.log('Answer check result:', { isCorrect });

    const answer = await QuizAnswerModel.saveAnswer(quizId, questionId, selectedOption, isCorrect);
    console.log('Answer saved:', { answerId: answer.id, isCorrect });

    res.json({ success: true, data: { answer, isCorrect } });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit answer', error: err.message });
  }
};

// ✅ Finish quiz
const finishQuiz = async (req, res) => {
  try {
    console.log('=== FINISH QUIZ ENDPOINT CALLED ===');
    const quizId = parseInt(req.params.quizId);
    console.log('Quiz ID:', quizId);
    
    // Get correct count
    const correctCount = await QuizAnswerModel.getCorrectAnswerCount(quizId);
    console.log('Correct count:', correctCount);
    
    // Get quiz details
    const quiz = await QuizModel.findById(quizId);
    console.log('Quiz found:', quiz ? 'YES' : 'NO');
    if (!quiz) {
      console.log('Quiz not found for ID:', quizId);
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    console.log('Quiz details:', {
      id: quiz.id,
      total_questions: quiz.total_questions,
      score: quiz.score,
      finished_at: quiz.finished_at
    });
    
    // Calculate score
    const score = (correctCount / quiz.total_questions) * 100;
    console.log('Score calculation:', {
      correctCount,
      totalQuestions: quiz.total_questions,
      calculatedScore: score
    });
    
    // Update quiz with result
    console.log('Updating quiz with result...');
    const updatedQuiz = await QuizModel.updateWithResult(quizId, score);
    console.log('Updated quiz:', {
      id: updatedQuiz.id,
      score: updatedQuiz.score,
      finished_at: updatedQuiz.finished_at
    });
    
    // Get results
    const results = await QuizModel.getQuizResults(quizId);
    console.log('Results retrieved:', results.length, 'records');
    
    res.json({
      success: true,
      message: 'Quiz finished successfully',
      data: {
        quiz: updatedQuiz,
        correctCount,
        totalCount: quiz.total_questions,
        score,
        results
      }
    });
    
    console.log('=== FINISH QUIZ ENDPOINT COMPLETED ===');
  } catch (err) {
    console.error('=== FINISH QUIZ ERROR ===', err);
    res.status(500).json({ success: false, message: 'Failed to finish quiz', error: err.message });
  }
};

// ✅ History and Results
const getUserQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;
    const quizzes = await QuizModel.getUserQuizzes(userId);
    res.json({ success: true, data: quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get user quizzes', error: err.message });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const results = await QuizModel.getQuizResults(quizId);
    if (!results.length) return res.status(404).json({ success: false, message: 'No results found' });

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get quiz results', error: err.message });
  }
};

module.exports = {
  startQuiz,
  submitAnswer,
  finishQuiz,
  getUserQuizzes,
  getQuizResults,
  validateQuizStart,
  validateAnswer
};
