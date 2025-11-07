const db = require('./db');

class McqQuestionModel {
  /**
   * Get questions from mcqquestions table by subject and difficulty
   */
  static async findBySubjectAndDifficulty(subject, difficulty, limit = 10) {
    // Handle subject abbreviations
    const subjectAliasMap = {
      'ds': 'Data Structures',
      'cn': 'Computer Networks', 
      'dbms': 'DBMS',
      'os': 'Operating Systems',
      'oops': 'OOPs'
    };
    
    const normalizedSubject = subjectAliasMap[subject.toLowerCase()] || subject;
    
    const query = `
      SELECT id, content, options, correct_option, explanation, subject, difficulty
      FROM mcqquestions
      WHERE LOWER(subject) = LOWER($1) AND LOWER(difficulty) = LOWER($2)
      ORDER BY RANDOM()
      LIMIT $3
    `;
    try {
      const result = await db.query(query, [normalizedSubject, difficulty, limit]);
      return result.rows;
    } catch (error) {
      throw new Error('❌ Failed to find MCQ questions: ' + error.message);
    }
  }

  /**
   * Get random questions from mcqquestions table by subject
   */
  static async findBySubject(subject, limit = 10) {
    // Handle subject abbreviations
    const subjectAliasMap = {
      'ds': 'Data Structures',
      'cn': 'Computer Networks', 
      'dbms': 'DBMS',
      'os': 'Operating Systems',
      'oops': 'OOPs'
    };
    
    const normalizedSubject = subjectAliasMap[subject.toLowerCase()] || subject;
    
    const query = `
      SELECT id, content, options, correct_option, explanation, subject, difficulty
      FROM mcqquestions
      WHERE LOWER(subject) = LOWER($1)
      ORDER BY RANDOM()
      LIMIT $2
    `;
    try {
      const result = await db.query(query, [normalizedSubject, limit]);
      return result.rows;
    } catch (error) {
      throw new Error('❌ Failed to find MCQ questions by subject: ' + error.message);
    }
  }

  /**
   * Get random questions from any subject
   */
  static async findAll(limit = 10) {
    const query = `
      SELECT id, content, options, correct_option, explanation, subject, difficulty
      FROM mcqquestions
      ORDER BY RANDOM()
      LIMIT $1
    `;
    try {
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error('❌ Failed to find all MCQ questions: ' + error.message);
    }
  }

  /**
   * Get questions by difficulty level only
   */
  static async findByDifficulty(difficulty, limit = 10) {
    const query = `
      SELECT id, content, options, correct_option, explanation, subject, difficulty
      FROM mcqquestions
      WHERE LOWER(difficulty) = LOWER($1)
      ORDER BY RANDOM()
      LIMIT $2
    `;
    try {
      const result = await db.query(query, [difficulty, limit]);
      return result.rows;
    } catch (error) {
      throw new Error('❌ Failed to find MCQ questions by difficulty: ' + error.message);
    }
  }

  /**
   * Find question by ID
   */
  static async findById(id) {
    const query = `
      SELECT id, content, options, correct_option, explanation, subject, difficulty
      FROM mcqquestions
      WHERE id = $1
    `;
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('❌ Failed to find question by ID: ' + error.message);
    }
  }

  /**
   * Get all available subjects from mcqquestions table
   */
  static async getSubjects() {
    const query = `
      SELECT DISTINCT subject
      FROM mcqquestions
      ORDER BY subject
    `;
    try {
      const result = await db.query(query);
      return result.rows.map(row => row.subject);
    } catch (error) {
      throw new Error('❌ Failed to get subjects: ' + error.message);
    }
  }

  /**
   * Get all available difficulty levels from mcqquestions table
   */
  static async getDifficulties() {
    const query = `
      SELECT DISTINCT difficulty
      FROM mcqquestions
      ORDER BY difficulty
    `;
    try {
      const result = await db.query(query);
      return result.rows.map(row => row.difficulty);
    } catch (error) {
      throw new Error('❌ Failed to get difficulties: ' + error.message);
    }
  }

  /**
   * Count questions by subject and difficulty
   */
  static async countBySubjectAndDifficulty(subject, difficulty) {
    const query = `
      SELECT COUNT(*) as count
      FROM mcqquestions
      WHERE LOWER(subject) = LOWER($1) AND LOWER(difficulty) = LOWER($2)
    `;
    try {
      const result = await db.query(query, [subject, difficulty]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error('❌ Failed to count questions: ' + error.message);
    }
  }

  /**
   * Count questions by subject
   */
  static async countBySubject(subject) {
    // Handle subject abbreviations
    const subjectAliasMap = {
      'ds': 'Data Structures',
      'cn': 'Computer Networks', 
      'dbms': 'DBMS',
      'os': 'Operating Systems',
      'oops': 'OOPs'
    };
    
    const normalizedSubject = subjectAliasMap[subject.toLowerCase()] || subject;
    
    const query = `
      SELECT COUNT(*) as count
      FROM mcqquestions
      WHERE LOWER(subject) = LOWER($1)
    `;
    try {
      const result = await db.query(query, [normalizedSubject]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error('❌ Failed to count questions by subject: ' + error.message);
    }
  }
}

module.exports = McqQuestionModel;
