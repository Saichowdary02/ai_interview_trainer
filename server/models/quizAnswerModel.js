const db = require('./db');

class QuizAnswerModel {
  static async saveAnswer(quizId, questionId, selectedOption, isCorrect) {
    console.log('Saving answer to DB:', { quizId, questionId, selectedOption, isCorrect });
    
    const result = await db.query(
      `INSERT INTO quiz_answers (quiz_id, question_id, selected_option, is_correct)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (quiz_id, question_id) DO UPDATE 
       SET selected_option=EXCLUDED.selected_option, is_correct=EXCLUDED.is_correct
       RETURNING *`,
      [quizId, questionId, selectedOption, isCorrect]
    );
    
    console.log('Answer saved result:', { rowCount: result.rowCount });
    return result.rows[0];
  }

  static async getCorrectAnswerCount(quizId) {
    const result = await db.query(
      `SELECT COUNT(*) AS correct_count FROM quiz_answers WHERE quiz_id=$1 AND is_correct=true`,
      [quizId]
    );
    return parseInt(result.rows[0].correct_count);
  }

  static async checkAnswer(questionId, selectedOption) {
    console.log('Checking answer:', { questionId, selectedOption });
    
    const result = await db.query(`SELECT correct_option, options FROM mcqquestions WHERE id=$1`, [questionId]);
    if (!result.rows.length) throw new Error('Question not found');
    
    const { correct_option, options } = result.rows[0];
    
    // Convert selected option to the actual value
    let selectedValue = selectedOption;
    
    // If selectedOption is a letter (A, B, C, D), convert to array index
    if (selectedOption.match(/^[A-D]$/i)) {
      const optionIndex = selectedOption.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
      selectedValue = options[optionIndex];
      console.log('Converted letter option:', { letter: selectedOption, index: optionIndex, value: selectedValue });
    }
    // If selectedOption is a numeric string (0, 1, 2, 3), convert to array index
    else if (selectedOption.match(/^[0-3]$/)) {
      const optionIndex = parseInt(selectedOption);
      selectedValue = options[optionIndex];
      console.log('Converted numeric option:', { number: selectedOption, index: optionIndex, value: selectedValue });
    }
    
    const isCorrect = correct_option === selectedValue;
    console.log('Answer check result:', { correctOption: correct_option, selectedOption, selectedValue, isCorrect });
    
    return isCorrect;
  }
}

module.exports = QuizAnswerModel;
