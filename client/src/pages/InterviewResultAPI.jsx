import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { interviewAPI } from '../api';

const InterviewResultAPI = ({ user }) => {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [explanations, setExplanations] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  // Fetch interview results from API
  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        
        // Get interview details and questions
        const interviewRes = await interviewAPI.getInterview(interviewId);
        if (interviewRes.data.success) {
          setInterview(interviewRes.data.data);
          setQuestions(interviewRes.data.data.questions);
        } else {
          throw new Error('Failed to load interview');
        }

// Get results with answers and feedback
        const resultsRes = await interviewAPI.getResults(interviewId);
        if (resultsRes.data.success) {
          const answersData = resultsRes.data.data.answers;
          
          // Transform answers to match expected format
          const formattedAnswers = {};
          answersData.forEach((answer, index) => {
            formattedAnswers[index] = {
              text: answer.answer_text,
              score: answer.score,
              feedback: answer.feedback,
              idealAnswer: answer.ideal_answer,
              submitted: true
            };
          });
          
          setAnswers(formattedAnswers);
        } else {
          throw new Error('Failed to load results');
        }
        
        // Get explanations for unanswered questions
        const explanationsRes = await interviewAPI.getExplanations(interviewId);
        if (explanationsRes.data.success) {
          const explanationsData = explanationsRes.data.data.explanations || [];
          
          // Transform explanations to match question indices
          const formattedExplanations = {};
          explanationsData.forEach((explanation, index) => {
            if (explanation && explanation.questionId) {
              // Find the question index for this explanation
              const questionIndex = questions.findIndex(q => q.id === explanation.questionId);
              if (questionIndex !== -1) {
                formattedExplanations[questionIndex] = {
                  explanation: explanation.explanation || explanation.text || 'No explanation available',
                  questionContent: explanation.questionContent || 'Unknown question'
                };
              }
            }
          });
          
          setExplanations(formattedExplanations);
        }
        
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error('Failed to load interview results');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [interviewId, navigate, questions]);

  const toggleExplanation = (questionIndex) => {
    setShowExplanation(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!interview || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">Interview not found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Calculate total score
  const totalScore = Object.values(answers).reduce((sum, answer) => {
    return sum + (answer.score || 0);
  }, 0);
  
  const averageScore = questions.length > 0 ? totalScore / questions.length : 0;
  const percentage = (averageScore / 10) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Overall Results */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {averageScore.toFixed(1)}/10
          </div>
          <div className="text-xl text-gray-600 mb-4">
            ({percentage.toFixed(1)}%)
          </div>
          <p className="text-gray-700">
            You answered {Object.keys(answers).length} out of {questions.length} questions
          </p>
        </div>

        {/* Individual Question Results */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            const answer = answers[index] || {};
            const isCorrect = answer.score >= 7;
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Question {index + 1}: {question.content}
                    </h3>
                    
                    {answer.text && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                        <p className="text-gray-700 bg-gray-100 rounded-lg p-3">
                          {answer.text}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.score || 0}/10
                        </div>
                        <span className="text-gray-600 ml-2">
                          Score
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleExplanation(index)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        {showExplanation[index] ? 'Hide Explanation' : 'Show Explanation'}
                      </button>
                    </div>
                  </div>
                </div>

{/* AI Explanation */}
                {showExplanation[index] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* For answered questions */}
                    {answer.feedback && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">AI Feedback:</h4>
                        <div className="text-gray-700 bg-gray-50 rounded-lg p-4">
                          {answer.feedback}
                        </div>
                      </div>
                    )}
                    
                    {answer.idealAnswer && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Ideal Answer:</h4>
                        <div className="text-gray-700 bg-green-50 rounded-lg p-4 border-l-4 border-green-400 shadow-sm">
                          <p className="whitespace-pre-wrap leading-relaxed">{answer.idealAnswer}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* For skipped questions - show explanation */}
                    {!answer.submitted && explanations[index] && explanations[index].explanation && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Question Explanation:</h4>
                        <div className="text-gray-700 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                          {explanations[index].explanation}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/interview/setup')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultAPI;
