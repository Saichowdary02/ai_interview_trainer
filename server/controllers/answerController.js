const AnswerModel = require('../models/answerModel');

// @desc    Get answer details
// @route   GET /api/answers/:answerId
// @access  Private
const getAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;

    const answer = await AnswerModel.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        error: 'Answer not found'
      });
    }

    // Verify user owns this answer (through interview ownership)
    const interviewModel = require('../models/interviewModel');
    const interview = await interviewModel.findById(answer.interview_id);
    
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        answer: {
          id: answer.id,
          question_content: answer.question_content,
          difficulty: answer.difficulty,
          answer_text: answer.answer_text,
          feedback: answer.feedback,
          score: answer.score,
          idealAnswer: answer.ideal_answer,
          answered_at: answer.answered_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get answer',
      details: error.message
    });
  }
};

// @desc    Update answer feedback (for admin/teachers)
// @route   PUT /api/answers/:answerId/feedback
// @access  Private
const updateFeedback = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { feedback, score } = req.body;

    if (feedback === undefined && score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide feedback or score to update'
      });
    }

    if (score !== undefined && (score < 1 || score > 10)) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 1 and 10'
      });
    }

    const answer = await AnswerModel.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        error: 'Answer not found'
      });
    }

    // In a real app, you'd check if user is admin or teacher
    // For now, allow any authenticated user to update their own answers

    const updatedAnswer = await AnswerModel.updateWithFeedback(
      answerId,
      feedback !== undefined ? feedback : answer.feedback,
      score !== undefined ? score : answer.score
    );

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: {
        answer: {
          id: updatedAnswer.id,
          question_content: updatedAnswer.question_content,
          answer_text: updatedAnswer.answer_text,
          feedback: updatedAnswer.feedback,
          score: updatedAnswer.score,
          answered_at: updatedAnswer.answered_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update feedback',
      details: error.message
    });
  }
};

// @desc    Get answers for an interview
// @route   GET /api/answers/interview/:interviewId
// @access  Private
const getAnswersByInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Verify interview belongs to user
    const interviewModel = require('../models/interviewModel');
    const interview = await interviewModel.findById(interviewId);
    
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const answers = await AnswerModel.findByInterviewId(interviewId);

    res.json({
      success: true,
      data: {
        answers: answers.map(answer => ({
          id: answer.id,
          question_content: answer.question_content,
          difficulty: answer.difficulty,
          answer_text: answer.answer_text,
          feedback: answer.feedback,
          score: answer.score,
          idealAnswer: answer.ideal_answer,
          answered_at: answer.answered_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get answers',
      details: error.message
    });
  }
};

// @desc    Delete an answer
// @route   DELETE /api/answers/:answerId
// @access  Private
const deleteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;

    const answer = await AnswerModel.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        error: 'Answer not found'
      });
    }

    // Verify user owns this answer
    const interviewModel = require('../models/interviewModel');
    const interview = await interviewModel.findById(answer.interview_id);
    
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await AnswerModel.delete(answerId);

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete answer',
      details: error.message
    });
  }
};

// @desc    Get average score for an interview
// @route   GET /api/answers/interview/:interviewId/average-score
// @access  Private
const getAverageScore = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Verify interview belongs to user
    const interviewModel = require('../models/interviewModel');
    const interview = await interviewModel.findById(interviewId);
    
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const avgScoreResult = await AnswerModel.getAverageScore(interviewId);

    res.json({
      success: true,
      data: {
        average_score: avgScoreResult.average_score,
        total_questions: parseInt(avgScoreResult.total_questions)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate average score',
      details: error.message
    });
  }
};

module.exports = {
  getAnswer,
  updateFeedback,
  getAnswersByInterview,
  deleteAnswer,
  getAverageScore
};
