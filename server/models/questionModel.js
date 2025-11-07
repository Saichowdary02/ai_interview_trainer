const db = require('./db');

class QuestionModel {
  /**
   * Create a new question
   * Supports MCQ format with options, correct_option, explanation, and subject
   */
  static async create({ content, difficulty, subject, options, correct_option, explanation }) {
    const query = `
      INSERT INTO questions (content, difficulty, subject, options, correct_option, explanation)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, content, difficulty, subject, options, correct_option, explanation
    `;
    const values = [content, difficulty, subject, options, correct_option, explanation];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('❌ Failed to create question: ' + error.message);
    }
  }

  /**
   * Fetch questions by difficulty and optional subject filter
   */
  static async findByDifficultyAndSubject(difficulty, subject, limit = 10) {
    const query = `
      SELECT * FROM questions
      WHERE LOWER(difficulty) = LOWER($1) AND LOWER(subject) = LOWER($2)
      ORDER BY RANDOM()
      LIMIT $3
    `;
    try {
      const result = await db.query(query, [difficulty, subject, limit]);
      return result.rows;
    } catch (error) {
      throw new Error('❌ Failed to find questions: ' + error.message);
    }
  }

  /**
   * Fetch questions by difficulty, subject, and count for interview setup
   */
  static async getQuestionsForInterview(difficulty, subject, count = 5) {
    const query = `
      SELECT id, content, difficulty, subject
      FROM questions
      WHERE LOWER(difficulty) = LOWER($1) AND LOWER(subject) = LOWER($2)
      ORDER BY RANDOM()
      LIMIT $3
    `;
    try {
      const result = await db.query(query, [difficulty, subject, count]);
      return result.rows;
    } catch (error) {
      throw new Error('❌ Failed to get questions for interview: ' + error.message);
    }
  }

  /**
   * Fetch all questions (for admin or testing)
   */
  static async findAll() {
    const query = 'SELECT * FROM questions ORDER BY subject, difficulty, id';
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error('❌ Failed to fetch all questions: ' + error.message);
    }
  }

  /**
   * Find question by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM questions WHERE id = $1';
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('❌ Failed to find question: ' + error.message);
    }
  }

  /**
   * Update a question (content, difficulty, subject, options, correct_option, explanation)
   */
  static async update(id, { content, difficulty, subject, options, correct_option, explanation }) {
    const query = `
      UPDATE questions 
      SET content = $1,
          difficulty = $2,
          subject = $3,
          options = $4,
          correct_option = $5,
          explanation = $6,
          updated_at = NOW()
      WHERE id = $7
      RETURNING id, content, difficulty, subject, options, correct_option, explanation
    `;
    const values = [content, difficulty, subject, options, correct_option, explanation, id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('❌ Failed to update question: ' + error.message);
    }
  }

  /**
   * Delete a question by ID
   */
  static async delete(id) {
    const query = 'DELETE FROM questions WHERE id = $1';
    try {
      await db.query(query, [id]);
      return true;
    } catch (error) {
      throw new Error('❌ Failed to delete question: ' + error.message);
    }
  }
}

module.exports = QuestionModel;
