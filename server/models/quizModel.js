const db = require('./db');

class QuizModel {
  static async create(userId, subject, difficulty, totalQuestions) {
    const result = await db.query(
      `INSERT INTO quizzes (user_id, subject, difficulty, total_questions)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, subject, difficulty, total_questions, started_at`,
      [userId, subject, difficulty, totalQuestions]
    );
    return result.rows[0];
  }

  static async getQuestionsByDifficultyAndSubject(difficulty, subject, limit = 10) {
    const result = await db.query(
      `SELECT id, content, options, correct_option, explanation, subject, difficulty
       FROM mcqquestions
       WHERE LOWER(difficulty)=LOWER($1) AND LOWER(subject)=LOWER($2)
       ORDER BY RANDOM()
       LIMIT $3`,
      [difficulty, subject, limit]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM quizzes WHERE id=$1', [id]);
    return result.rows[0];
  }

  static async updateWithResult(id, score) {
    const result = await db.query(
      `UPDATE quizzes SET score=$2, finished_at=NOW() WHERE id=$1
       RETURNING *`,
      [id, score]
    );
    return result.rows[0];
  }

  static async getQuizResults(quizId) {
    const result = await db.query(
      `WITH quiz_questions AS (
          SELECT DISTINCT qa.question_id, qa.id as answer_id, qa.answered_at
          FROM quiz_answers qa
          WHERE qa.quiz_id = $1
        ),
        ordered_questions AS (
          SELECT qm.id, qm.content, qm.options, qm.correct_option, qm.explanation,
                 qq.answer_id, qq.answered_at,
                 ROW_NUMBER() OVER (ORDER BY qq.answered_at ASC, qq.answer_id ASC) as question_order
          FROM quiz_questions qq
          INNER JOIN mcqquestions qm ON qq.question_id = qm.id
        ),
        all_quiz_data AS (
          SELECT q.id AS quiz_id, q.subject, q.difficulty, q.total_questions, q.score,
                 oq.id as question_id, oq.content, oq.options, oq.correct_option, oq.explanation,
                 qa.selected_option, qa.is_correct, oq.question_order
          FROM quizzes q
          CROSS JOIN ordered_questions oq
          LEFT JOIN quiz_answers qa ON q.id = qa.quiz_id AND oq.id = qa.question_id
          WHERE q.id = $1
        )
        SELECT quiz_id, subject, difficulty, total_questions, score,
               question_id, content, options, correct_option, explanation,
               COALESCE(selected_option, 'skipped') as selected_option,
               COALESCE(is_correct, false) as is_correct,
               question_order
        FROM all_quiz_data
        ORDER BY question_order`,
      [quizId]
    );
    return result.rows;
  }

  static async getUserQuizzes(userId, limit = 10) {
    const result = await db.query(
      `SELECT * FROM quizzes WHERE user_id=$1 ORDER BY started_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

module.exports = QuizModel;
