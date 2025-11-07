import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { interviewAPI } from '../api';
import VoiceInputButton from '../components/VoiceInputButton';

const Interview = ({ user }) => {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const { difficulty } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (interviewId) {
      fetchInterviewData(interviewId);
    } else if (difficulty) {
      startNewInterview(difficulty);
    }
  }, [interviewId, difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewInterview = async (difficulty) => {
    setLoading(true);
    try {
      const response = await interviewAPI.start(difficulty);
      const newInterview = response.data.data.interview;
      setInterview(newInterview);
      await fetchQuestions(newInterview.id);
    } catch (error) {
      toast.error('Failed to start interview');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewData = async (id) => {
    setLoading(true);
    try {
      await fetchQuestions(id);
    } catch (error) {
      toast.error('Failed to load interview');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (id) => {
    try {
      const response = await interviewAPI.getQuestions(id);
      setQuestions(response.data.data.questions || []);
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  const handleAnswerChange = (questionId, answerText) => {
    setAnswers({
      ...answers,
      [questionId]: answerText,
    });
  };

  const handleSubmitAnswer = async (questionId) => {
    const answerText = answers[questionId];
    if (!answerText?.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmitting(true);
    try {
      const response = await interviewAPI.submitAnswer(interview.id, questionId, answerText);
      const updatedAnswer = response.data.data.answer;
      
      // Update the answers with AI feedback
      setAnswers({
        ...answers,
        [questionId]: {
          text: answerText,
          score: updatedAnswer.score,
          feedback: updatedAnswer.feedback,
        },
      });

      toast.success('Answer submitted successfully!');
      
      // Move to next question or show results
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentAnswer = (questionId) => {
    const answer = answers[questionId];
    if (!answer) return { text: '', score: null, feedback: null };
    if (typeof answer === 'string') return { text: answer, score: null, feedback: null };
    return answer;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!interview || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
        <p className="text-gray-600 mb-6">There are no questions for this interview difficulty level.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer(currentQuestion.id);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Interview Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Interview Session #{interview.id}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(interview.difficulty)}`}>
                {interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1)} Difficulty
              </span>
              <span className="text-gray-600 text-sm">
                Started: {formatDateTime(interview.started_at)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Question {currentQuestionIndex + 1}
          </h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            {currentQuestion.content}
          </p>
        </div>

        {/* Answer Input */}
        <div className="space-y-4">
          <textarea
            value={currentAnswer.text || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Type your answer here..."
            disabled={submitting}
          />
          
          {/* Voice Input Button */}
          <div className="flex justify-center">
            <VoiceInputButton 
              onTextChange={(text, mode) => {
                const currentText = currentAnswer.text || '';
                const newText = mode === 'append' && currentText ? currentText + ' ' + text : text;
                handleAnswerChange(currentQuestion.id, newText);
              }}
              disabled={submitting}
              mode="append"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1 || submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <button
              onClick={() => handleSubmitAnswer(currentQuestion.id)}
              disabled={submitting || !currentAnswer.text?.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Answer'
              )}
            </button>
          </div>
        </div>

        {/* AI Feedback */}
        {(currentAnswer.score !== null || currentAnswer.feedback) && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">AI Feedback</h4>
              {currentAnswer.score !== null && (
                <span className="text-lg font-bold text-blue-900">
                  Score: {currentAnswer.score}/10
                </span>
              )}
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">
              {currentAnswer.feedback || 'Your answer has been evaluated by our AI system.'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentQuestionIndex
                ? 'bg-blue-600'
                : answers[_.id] ? 'bg-green-400' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h3>
              <p className="text-gray-600 mb-6">
                You've successfully completed the {interview.difficulty} difficulty interview.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg"
                >
                  View Interview History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
