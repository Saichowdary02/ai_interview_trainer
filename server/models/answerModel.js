const db = require('./db');

class AnswerModel {
  // Create a new answer
  static async create(interviewId, questionId, answerText) {
    const query = `
      INSERT INTO answers (interview_id, question_id, answer_text)
      VALUES ($1, $2, $3)
      RETURNING id, interview_id, question_id, answer_text, answered_at
    `;
    const values = [interviewId, questionId, answerText];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to create answer: ' + error.message);
    }
  }

  // Update answer with AI feedback, score, and ideal answer
  static async updateWithFeedback(id, feedback, score, idealAnswer = null) {
    const query = `
      UPDATE answers 
      SET feedback = $1, score = $2, ideal_answer = $3
      WHERE id = $4
      RETURNING id, interview_id, question_id, answer_text, feedback, score, ideal_answer, answered_at
    `;
    const values = [feedback, score, idealAnswer, id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to update answer: ' + error.message);
    }
  }

  // Find answer by ID
  static async findById(id) {
    const query = `
      SELECT a.*, q.content as question_content, q.difficulty
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.id = $1
    `;
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to find answer: ' + error.message);
    }
  }

  // Get all answers for an interview
  static async findByInterviewId(interviewId) {
    const query = `
      SELECT a.id, a.interview_id, a.question_id, a.answer_text, a.score, a.feedback, a.ideal_answer, a.answered_at,
             q.content as question_content, q.difficulty
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.interview_id = $1
      ORDER BY a.answered_at
    `;
    try {
      const result = await db.query(query, [interviewId]);
      return result.rows;
    } catch (error) {
      throw new Error('Failed to find answers: ' + error.message);
    }
  }

  // Get answers for a specific question in an interview
  static async findByInterviewAndQuestion(interviewId, questionId) {
    const query = `
      SELECT a.*, q.content as question_content
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.interview_id = $1 AND a.question_id = $2
    `;
    try {
      const result = await db.query(query, [interviewId, questionId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to find answer: ' + error.message);
    }
  }

  // Delete answer
  static async delete(id) {
    const query = 'DELETE FROM answers WHERE id = $1';
    try {
      await db.query(query, [id]);
      return true;
    } catch (error) {
      throw new Error('Failed to delete answer: ' + error.message);
    }
  }

  // Get average score for an interview
  static async getAverageScore(interviewId) {
    const query = `
      SELECT AVG(score) as average_score, COUNT(*) as total_questions
      FROM answers
      WHERE interview_id = $1 AND score IS NOT NULL
    `;
    try {
      const result = await db.query(query, [interviewId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to calculate average score: ' + error.message);
    }
  }

  // Create answer with feedback and score (for completed interviews)
  static async createWithFeedback(interviewId, questionId, answerText, feedback, score, idealAnswer = null) {
    const query = `
      INSERT INTO answers (interview_id, question_id, answer_text, feedback, score, ideal_answer)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, interview_id, question_id, answer_text, feedback, score, ideal_answer, answered_at
    `;
    const values = [interviewId, questionId, answerText, feedback, score, idealAnswer];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to create answer with feedback: ' + error.message);
    }
  }
}

module.exports = AnswerModel;
