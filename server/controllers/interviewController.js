const { OpenAI } = require('openai');
const InterviewModel = require('../models/interviewModel');
const QuestionModel = require('../models/questionModel');
const AnswerModel = require('../models/answerModel');

// Load environment variables
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @desc    Start a new interview session
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const { difficulty } = req.body;
    const userId = req.user.id;

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'difficult'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty level. Must be: easy, medium, or difficult'
      });
    }

    // Create new interview session with default values
    const interview = await InterviewModel.create(userId, difficulty);

    res.json({
      success: true,
      message: 'Interview session started',
      data: {
        interview: {
          id: interview.id,
          difficulty: interview.difficulty,
          started_at: interview.started_at
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start interview',
      details: error.message
    });
  }
};

// @desc    Get questions for an interview
// @route   GET /api/interview/:interviewId/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Get interview to verify it belongs to the user
    const interview = await InterviewModel.findById(interviewId);
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Get questions for the difficulty level and subject
    // If subject is not set, get questions for the difficulty only
    let questions;
    if (interview.subject) {
      questions = await QuestionModel.findByDifficultyAndSubject(
        interview.difficulty, 
        interview.subject, 
        parseInt(interview.question_count) || 5
      );
    } else {
      // If no subject is set, get questions for the difficulty with a default subject
      // or get a random selection from available subjects
      questions = await QuestionModel.findByDifficultyAndSubject(
        interview.difficulty, 
        'java', // Default subject (lowercase to match database)
        5 // Default to 5 questions since question_count column doesn't exist
      );
    }

    res.json({
      success: true,
      data: {
        questions: questions.map(q => ({
          id: q.id,
          content: q.content,
          difficulty: q.difficulty,
          subject: q.subject
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

// @desc    Submit an answer and get AI feedback
// @route   POST /api/interview/:interviewId/submit-answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionId, answerText, isSkipped } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide questionId'
      });
    }

    // For skipped questions, answerText can be empty, but we still need to validate
    if (answerText === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide answerText'
      });
    }

    // Verify interview belongs to user
    const interview = await InterviewModel.findById(interviewId);
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Get the question
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Check if answer already exists for this question
    const existingAnswer = await AnswerModel.findByInterviewAndQuestion(interviewId, questionId);
    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        error: 'Answer already submitted for this question'
      });
    }

    // Create the answer record
    const answer = await AnswerModel.create(interviewId, questionId, answerText);

// Generate AI feedback, score, and ideal answer
    const feedback = await generateAIFeedback(question.content, answerText, question.difficulty, isSkipped);

    // Update answer with feedback, score, and ideal answer
    const updatedAnswer = await AnswerModel.updateWithFeedback(
      answer.id,
      feedback.feedback,
      feedback.score,
      feedback.idealAnswer
    );

    // Get updated average score for the interview
    const avgScoreResult = await AnswerModel.getAverageScore(interviewId);

res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        answer: {
          id: updatedAnswer.id,
          question_content: question.content,
          answer_text: updatedAnswer.answer_text,
          feedback: updatedAnswer.feedback,
          score: updatedAnswer.score,
          idealAnswer: updatedAnswer.ideal_answer,
          ideal_answer: updatedAnswer.ideal_answer, // Also include snake_case for compatibility
          answered_at: updatedAnswer.answered_at,
          average_score: avgScoreResult.average_score
        }
      }
    });
  } catch (error) {
    console.error('Error in submitAnswer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit answer',
      details: error.message
    });
  }
};

// @desc    Get interview results
// @route   GET /api/interview/:interviewId/results
// @access  Private
const getResults = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    console.log('DEBUG: getResults called with interviewId:', interviewId);
    console.log('DEBUG: Current user ID:', req.user.id);

    // Verify interview belongs to user
    const interview = await InterviewModel.findById(interviewId);
    if (!interview || interview.user_id !== req.user.id) {
      console.log('DEBUG: Interview not found or does not belong to user');
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Get all answers for the interview
    const answers = await AnswerModel.findByInterviewId(interviewId);
    
    // Debug logging to see what data we're getting from the database
    console.log('DEBUG: Answers from database:', answers.map(a => ({
      id: a.id,
      hasIdealAnswer: !!a.ideal_answer,
      idealAnswer: a.ideal_answer ? a.ideal_answer.substring(0, 50) + '...' : null,
      allFields: Object.keys(a)
    })));

    // Calculate final score
    const avgScoreResult = await AnswerModel.getAverageScore(interviewId);
    const finalScore = avgScoreResult.average_score || 0;

    // Update interview with final score if answers exist
    if (answers.length > 0) {
      await InterviewModel.updateScore(interviewId, finalScore);
    }

    res.json({
      success: true,
      data: {
        interview: {
          id: interview.id,
          difficulty: interview.difficulty,
          started_at: interview.started_at,
          finished_at: interview.finished_at,
          final_score: finalScore,
          total_questions: answers.length
        },
        answers: answers.map(answer => ({
          id: answer.id,
          question_content: answer.question_content,
          answer_text: answer.answer_text,
          feedback: answer.feedback,
          score: answer.score,
          idealAnswer: answer.ideal_answer,
          ideal_answer: answer.ideal_answer, // Also include snake_case for compatibility
          answered_at: answer.answered_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get results',
      details: error.message
    });
  }
};

// @desc    Get user's interview history
// @route   GET /api/interview/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviews = await InterviewModel.findByUserId(userId);

    res.json({
      success: true,
      data: {
        interviews: interviews.map(interview => ({
          id: interview.id,
          difficulty: interview.difficulty,
          started_at: interview.started_at,
          finished_at: interview.finished_at,
          score: interview.score || 0,
          question_count: interview.total_questions || 0,
          average_score: interview.average_score || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get history',
      details: error.message
    });
  }
};

// Generate AI feedback, score, and ideal answer using OpenAI GPT-4o
const generateAIFeedback = async (question, answer, difficulty, isSkipped = false) => {
  try {
    // Handle skipped questions - use hardcoded feedback to avoid AI call
    if (isSkipped || !answer || answer.trim() === '') {
      return {
        feedback: 'You need to answer the question first to get AI Feedback',
        score: 0,
        idealAnswer: await generateIdealAnswer(question, difficulty)
      };
    }

    // Define scoring criteria based on difficulty
    const criteria = {
      easy: 'Evaluate the answer based on basic understanding, clarity, and relevance to the question.',
      medium: 'Evaluate the answer based on depth of knowledge, structure, examples, and problem-solving approach.',
      hard: 'Evaluate the answer based on comprehensive understanding, critical thinking, innovation, and technical depth.'
    };

    const prompt = `
You are a professional technical interviewer evaluating a candidate's response in a mock technical interview.

When evaluating the answer, follow these strict guidelines:

SCORING GUIDE:
10: Perfect — complete, accurate, clear, and well-articulated with examples or reasoning.
8–9: Strong — mostly correct, with minor omissions or unclear phrasing.
6–7: Moderate — some understanding shown, but lacks depth or has noticeable errors.
3–5: Weak — limited understanding, significant gaps, or confusion in core concepts.
1–2: Very poor — major misconceptions or random statements.
0: Irrelevant or completely incorrect answer.

EVALUATION METRICS:
- Conceptual understanding: Does the candidate truly understand the topic?
- Completeness: Does the answer cover key aspects or steps?
- Clarity of explanation: Is the reasoning coherent and logically presented?
- Accuracy: Are definitions, processes, and examples correct?
- Depth: Does the candidate show critical thinking or surface-level recall?

Question: ${question}
Answer: ${answer}

Please provide:
1. A score from 0 to 10 based on the scoring guide above
2. Structured feedback that includes:
   - ✅ Strengths: What was done well or correctly understood
   - ⚠️ Mistakes / Gaps: Specific conceptual or logical errors, missing points, or unclear reasoning
   - 🚀 Improvements: Actionable advice on how the candidate can enhance their understanding or presentation
3. An ideal answer that demonstrates how the question should be answered in a real interview

Format your response exactly as:
SCORE: [number between 0-10]
FEEDBACK:
✅ Strengths: [Mention what was done well.]
⚠️ Mistakes / Gaps: [List key errors or missing concepts.]
🚀 Improvements: [Give actionable advice on how to improve or structure a better answer next time.]

ANSWER: [ideal answer for the question]

IMPORTANT: If the answer is irrelevant or completely incorrect, respond only with:
"This answer is not relevant to the question, hence the score is 0."
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Use GPT-4o for better quality
      messages: [
        {
          role: 'system',
          content: 'You are a professional technical interviewer providing structured, actionable feedback to help candidates improve their interview performance. Follow the exact format specified and be strict in your evaluation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6, // Lower temperature for more focused responses
      max_tokens: 1000
    });

    const aiResponse = response.choices[0].message.content;
    
    // Parse the response with more robust matching
    const scoreMatch = aiResponse.match(/SCORE:\s*(\d+(?:\.\d+)?)/i);
    const feedbackMatch = aiResponse.match(/FEEDBACK:\s*([\s\S]*?)(?:\nANSWER:|$)/is);
    const answerMatch = aiResponse.match(/ANSWER:\s*(.+)$/is);

    // Check for irrelevant answer response
    if (aiResponse.includes("This answer is not relevant to the question, hence the score is 0.")) {
      return {
        feedback: "This answer is not relevant to the question, hence the score is 0.",
        score: 0,
        idealAnswer: await generateIdealAnswer(question, difficulty)
      };
    }

    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 5.0;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : 'No specific feedback available';
    const idealAnswer = answerMatch ? answerMatch[1].trim() : await generateIdealAnswer(question, difficulty);

    return {
      feedback,
      score: Math.min(Math.max(score, 0), 10), // Ensure score is between 0-10
      idealAnswer
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback feedback if AI fails
    return {
      feedback: 'AI feedback generation failed. The answer has been recorded for manual review.',
      score: 5.0,
      idealAnswer: await generateIdealAnswer(question, difficulty)
    };
  }
};

// Generate ideal answer for a question
const generateIdealAnswer = async (question, difficulty) => {
  try {
    const prompt = `
You are a professional technical interviewer providing ideal answers for interview questions.
Question: ${question}

Please provide a comprehensive, well-structured ideal answer that demonstrates excellent understanding and communication skills.
The answer should be appropriate for ${difficulty} difficulty level and suitable for a real technical interview.

Format your response exactly as:
ANSWER: [ideal answer for the question]
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional technical interviewer providing comprehensive ideal answers for interview questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const aiResponse = response.choices[0].message.content;
    
    // Parse the ideal answer
    const answerMatch = aiResponse.match(/ANSWER:\s*(.+)$/is);
    const idealAnswer = answerMatch ? answerMatch[1].trim() : 'No ideal answer generated';

    return idealAnswer;
  } catch (error) {
    console.error('OpenAI ideal answer generation error:', error);
    return 'Unable to generate ideal answer at this time.';
  }
};

// @desc    Setup enhanced interview with questions from database
// @route   POST /api/interview/setup
// @access  Private
const setupInterview = async (req, res) => {
  try {
    const { difficulty, subject, questionCount, timeLimit, inputType } = req.body;
    const userId = req.user.id;

    console.log('DEBUG: setupInterview called with:', { difficulty, subject, questionCount, timeLimit, inputType, userId });

    // Validate inputs
    if (!difficulty || !subject || !questionCount || !timeLimit || !inputType) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: difficulty, subject, questionCount, timeLimit, inputType'
      });
    }

    if (questionCount < 5 || questionCount > 25) {
      return res.status(400).json({
        success: false,
        error: 'Question count must be between 5 and 25'
      });
    }

    // Get existing questions from database based on difficulty and subject
    console.log('DEBUG: Getting questions for interview...');
    const questions = await QuestionModel.getQuestionsForInterview(difficulty, subject, questionCount);
    console.log('DEBUG: Questions found:', questions.length);

    // Check if we have enough questions in the database
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: `No questions found for ${difficulty} difficulty and ${subject} subject. Please try a different combination.`
      });
    }

    if (questions.length < questionCount) {
      return res.status(400).json({
        success: false,
        error: `Only ${questions.length} questions available for ${difficulty} difficulty and ${subject} subject. Please reduce the question count or try a different combination.`
      });
    }

    // Create interview session
    console.log('DEBUG: Creating interview with config...');
    const interview = await InterviewModel.createWithConfig(userId, difficulty, subject, questionCount, timeLimit, inputType);
    console.log('DEBUG: Interview created:', interview.id);

    // Link existing questions to interview
    console.log('DEBUG: Linking questions to interview...');
    await InterviewModel.linkQuestions(interview.id, questions.map(q => q.id));
    console.log('DEBUG: Questions linked successfully');

    res.json({
      success: true,
      message: 'Interview setup complete',
      data: {
        interviewId: interview.id,
        difficulty: interview.difficulty,
        subject,
        questionCount,
        timeLimit,
        inputType,
        questions: questions.map(q => ({
          id: q.id,
          content: q.content,
          difficulty: q.difficulty,
          subject: q.subject
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error in setupInterview:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to setup interview',
      details: error.message,
      stack: error.stack
    });
  }
};

// @desc    Get interview details with questions
// @route   GET /api/interview/:interviewId
// @access  Private
const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Verify interview belongs to user
    const interview = await InterviewModel.findById(interviewId);
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Get questions for this interview
    const questions = await InterviewModel.getQuestions(interviewId);

    res.json({
      success: true,
      data: {
        id: interview.id,
        difficulty: interview.difficulty,
        subject: interview.subject || null,
        questionCount: interview.question_count || 5,
        timeLimit: interview.time_limit || 'nolimit',
        inputType: interview.input_type || 'text',
        startedAt: interview.started_at,
        questions: questions.map(q => ({
          id: q.id,
          content: q.content,
          difficulty: q.difficulty,
          subject: q.subject
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get interview',
      details: error.message
    });
  }
};

// @desc    Complete interview and calculate final results
// @route   POST /api/interview/:interviewId/complete
// @access  Private
const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { finalScore, answers } = req.body;

    // Verify interview belongs to user
    const interview = await InterviewModel.findById(interviewId);
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Update interview as completed
    await InterviewModel.complete(interviewId, finalScore);

    // Save answers if provided
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        await AnswerModel.createWithFeedback(
          interviewId,
          answer.questionId,
          answer.answerText,
          answer.feedback,
          answer.score,
          answer.idealAnswer || null
        );
      }
    }

    res.json({
      success: true,
      message: 'Interview completed successfully',
      data: {
        finalScore,
        interviewId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to complete interview',
      details: error.message
    });
  }
};

// @desc    Get explanations for unanswered questions
// @route   GET /api/interview/:interviewId/explanations
// @access  Private
const getExplanations = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Verify interview belongs to user
    const interview = await InterviewModel.findById(interviewId);
    if (!interview || interview.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Get all questions for this interview
    const questions = await InterviewModel.getQuestions(interviewId);
    
    // Get answers that have been submitted
    const answers = await AnswerModel.findByInterviewId(interviewId);
    const answeredQuestionIds = answers.map(answer => answer.question_id);

    // Get explanations for unanswered questions
    const explanations = [];
    for (const question of questions) {
      if (!answeredQuestionIds.includes(question.id)) {
        // Generate explanation for unanswered question
        const explanation = await generateQuestionExplanation(question.content, question.difficulty);
        explanations.push({
          questionId: question.id,
          questionContent: question.content,
          explanation: explanation
        });
      }
    }

    res.json({
      success: true,
      data: {
        explanations
      }
    });
  } catch (error) {
    console.error('Error in getExplanations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get explanations',
      details: error.message
    });
  }
};

// Generate explanation for a question
const generateQuestionExplanation = async (question, difficulty) => {
  try {
    const prompt = `
You are an experienced technical interviewer providing explanations for interview questions.
Question: ${question}

Please provide a concise explanation (up to 50 words) of what this question is testing and what key concepts it covers.

Format your response exactly as:
EXPLANATION: [concise explanation up to 50 words]

Focus on the core concepts and skills being evaluated.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional technical interviewer providing concise explanations of interview questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 300
    });

    const aiResponse = response.choices[0].message.content;
    
    // Parse the explanation
    const explanationMatch = aiResponse.match(/EXPLANATION:\s*(.+)$/is);
    const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation available';

    return explanation;
  } catch (error) {
    console.error('OpenAI explanation generation error:', error);
    return 'Unable to generate explanation at this time.';
  }
};

// Generate AI questions based on difficulty, subject, and count
const generateAIQuestions = async (difficulty, subject, count) => {
  try {
    const prompt = `
Generate ${count} technical interview questions for ${subject} at ${difficulty} difficulty level.
The questions should be practical and relevant to real-world scenarios.

Format each question on a new line, numbered 1-${count}:

1. [Question 1]
2. [Question 2]
3. [Question 3]
...
${count}. [Question ${count}]

Make sure the questions are appropriate for the difficulty level:
- Easy: Basic concepts and fundamentals
- Medium: Intermediate concepts with some complexity
- Hard: Advanced concepts requiring deep understanding
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a technical interview question generator for software engineering positions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });

    const questionsText = response.choices[0].message.content;
    
    // Parse questions from numbered list
    const questions = questionsText
      .split('\n')
      .map(line => {
        const match = line.match(/^\d+\.\s*(.+)$/);
        return match ? match[1].trim() : null;
      })
      .filter(question => question && question.length > 0);

    return questions.slice(0, count); // Ensure we return exactly the requested count
  } catch (error) {
    console.error('OpenAI question generation error:', error);
    // Fallback questions if AI fails
    return [
      `What is ${subject} and why is it important?`,
      `Explain the basic concepts of ${subject}.`,
      `What are the common use cases for ${subject}?`,
      `Describe a simple implementation of ${subject}.`,
      `What challenges might you face when working with ${subject}?`
    ].slice(0, count);
  }
};

module.exports = {
  startInterview,
  getQuestions,
  submitAnswer,
  getResults,
  getHistory,
  setupInterview,
  getInterview,
  completeInterview,
  getExplanations
};
