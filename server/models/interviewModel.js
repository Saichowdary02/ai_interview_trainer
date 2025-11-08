const db = require('./db');

class InterviewModel {
  // Create a new interview session
  static async create(userId, difficulty) {
    const query = `
      INSERT INTO interviews (user_id, difficulty)
      VALUES ($1, $2)
      RETURNING id, user_id, difficulty, started_at
    `;
    const values = [userId, difficulty];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to create interview: ' + error.message);
    }
  }

  // Find interview by ID
  static async findById(id) {
    const query = `
      SELECT i.id, i.user_id, i.difficulty, i.subject, i.question_count, i.time_limit, i.input_type, 
             i.started_at, i.finished_at, i.score, i.average_score, u.name as user_name 
      FROM interviews i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `;
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to find interview: ' + error.message);
    }
  }

  // Get all interviews for a user
  static async findByUserId(userId) {
    const query = `
      SELECT i.*, 
             COUNT(a.id) as question_count,
             AVG(a.score) as average_score
      FROM interviews i
      LEFT JOIN answers a ON i.id = a.interview_id
      WHERE i.user_id = $1
      GROUP BY i.id
      ORDER BY i.started_at DESC
    `;
    try {
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error('Failed to find interviews: ' + error.message);
    }
  }

  // Update interview score and finish time
  static async updateScore(id, score) {
    const query = `
      UPDATE interviews 
      SET score = $1, finished_at = NOW()
      WHERE id = $2
      RETURNING id, score, finished_at
    `;
    try {
      const result = await db.query(query, [score, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to update interview score: ' + error.message);
    }
  }

  // Create a new interview session with enhanced configuration
  static async createWithConfig(userId, difficulty, subject, questionCount, timeLimit, inputType) {
    const query = `
      INSERT INTO interviews (user_id, difficulty, subject, question_count, time_limit, input_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, difficulty, subject, question_count, time_limit, input_type, started_at
    `;
    const values = [userId, difficulty, subject, questionCount, timeLimit, inputType];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to create interview: ' + error.message);
    }
  }

  // Link questions to an interview
  static async linkQuestions(interviewId, questionIds) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      for (const questionId of questionIds) {
        const query = `
          INSERT INTO interview_questions (interview_id, question_id)
          VALUES ($1, $2)
        `;
        await client.query(query, [interviewId, questionId]);
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error('Failed to link questions: ' + error.message);
    } finally {
      client.release();
    }
  }

  // Get questions for an interview
  static async getQuestions(interviewId) {
    const query = `
      SELECT q.id, q.content, q.difficulty, q.subject
      FROM questions q
      JOIN interview_questions iq ON q.id = iq.question_id
      WHERE iq.interview_id = $1
      ORDER BY q.id
    `;
    try {
      const result = await db.query(query, [interviewId]);
      return result.rows;
    } catch (error) {
      throw new Error('Failed to get interview questions: ' + error.message);
    }
  }

  // Complete interview
  static async complete(interviewId, finalScore) {
    const query = `
      UPDATE interviews 
      SET score = $1, finished_at = NOW()
      WHERE id = $2
      RETURNING id, score, finished_at
    `;
    try {
      const result = await db.query(query, [finalScore, interviewId]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to complete interview: ' + error.message);
    }
  }

  // Delete interview and related answers
  static async delete(id) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // Delete answers first (due to foreign key constraint)
      await client.query('DELETE FROM answers WHERE interview_id = $1', [id]);
      
      // Delete interview questions link
      await client.query('DELETE FROM interview_questions WHERE interview_id = $1', [id]);
      
      // Delete interview
      await client.query('DELETE FROM interviews WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error('Failed to delete interview: ' + error.message);
    } finally {
      client.release();
    }
  }
}

module.exports = InterviewModel;
