const QuestionModel = require('../models/questionModel');

// ✅ Get all questions (Admin / Debug)
const getAllQuestions = async (req, res) => {
  try {
    const questions = await QuestionModel.findAll();

    res.json({
      success: true,
      data: {
        questions: questions.map(q => ({
          id: q.id,
          subject: q.subject,
          content: q.content,
          difficulty: q.difficulty,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          explanation: q.explanation
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get questions',
      details: error.message
    });
  }
};

// ✅ Get questions by subject and difficulty
// Example: GET /api/questions/javascript/easy?limit=5
const getQuestionsByDifficultyAndSubject = async (req, res) => {
  try {
    const { subject, difficulty } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const validDifficulties = ['easy', 'medium', 'difficult'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
      error: 'Invalid difficulty level. Must be: easy, medium, or difficult'
      });
    }

    const questions = await QuestionModel.findBySubjectAndDifficulty(subject, difficulty, limit);

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        error: 'No questions found for the given subject and difficulty'
      });
    }

    res.json({
      success: true,
      count: questions.length,
      data: questions.map(q => ({
        id: q.id,
        subject: q.subject,
        content: q.content,
        difficulty: q.difficulty,
        options: {
          a: q.option_a,
          b: q.option_b,
          c: q.option_c,
          d: q.option_d
        },
        correct_option: q.correct_option,
        explanation: q.explanation
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get questions',
      details: error.message
    });
  }
};

// ✅ Add a new question (Admin Only)
const addQuestion = async (req, res) => {
  try {
    const {
      subject,
      content,
      difficulty,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation
    } = req.body;

    // Validate required fields
    if (!subject || !content || !difficulty || !correct_option) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: subject, content, difficulty, correct_option'
      });
    }

    const validDifficulties = ['easy', 'medium', 'difficult'];
    const validOptions = ['a', 'b', 'c', 'd'];

    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Invalid difficulty level' });
    }
    if (!validOptions.includes(correct_option.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'correct_option must be one of: a, b, c, d' });
    }

    const newQuestion = await QuestionModel.create({
      subject,
      content,
      difficulty,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option: correct_option.toLowerCase(),
      explanation
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: newQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add question',
      details: error.message
    });
  }
};

// ✅ Update question (Admin Only)
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updateFields = req.body;

    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    const updatedQuestion = await QuestionModel.update(questionId, updateFields);

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update question',
      details: error.message
    });
  }
};

// ✅ Delete question (Admin Only)
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await QuestionModel.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    await QuestionModel.delete(questionId);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete question',
      details: error.message
    });
  }
};

module.exports = {
  getAllQuestions,
  getQuestionsByDifficultyAndSubject,
  addQuestion,
  updateQuestion,
  deleteQuestion
};
