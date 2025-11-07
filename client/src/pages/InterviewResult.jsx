import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const InterviewResult = ({ user }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { questions, answers } = state || {};

console.log('InterviewResult received state:', state);
  console.log('Questions:', questions);
  console.log('Answers:', answers);
  
// Enhanced debug logging for ideal answers
  if (answers) {
    console.log('=== INTERVIEW RESULTS DEBUG ===');
    Object.keys(answers).forEach(key => {
      const answer = answers[key];
      console.log(`Answer ${key}:`, {
        score: answer.score,
        hasFeedback: !!answer.feedback,
        hasIdealAnswer: !!answer.idealAnswer,
        feedback: answer.feedback,
        idealAnswer: answer.idealAnswer,
        fullAnswerObject: answer
      });
    });
    console.log('=== END DEBUG ===');
  }

// Initialize all explanations to be visible by default for better user experience
  const [showExplanation, setShowExplanation] = useState({});
  
  // Effect to set all explanations to true when questions are available
  useEffect(() => {
    if (questions && questions.length > 0) {
      const initialExplanations = {};
      questions.forEach((_, index) => {
        initialExplanations[index] = true;
      });
      setShowExplanation(initialExplanations);
    }
  }, [questions]);

  if (!questions || !answers) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">No results found</h2>
            <button
              onClick={() => navigate('/interview/setup')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Start New Interview
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

  const toggleExplanation = (questionIndex) => {
    setShowExplanation(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

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
                        {showExplanation[index] ? 'Hide Details' : 'Show Details & Ideal Answer'}
                      </button>
                    </div>
                  </div>
                </div>

{/* AI Explanation */}
                {showExplanation[index] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Always show AI Feedback section */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">AI Feedback:</h4>
                      <div className="text-gray-700 bg-gray-50 rounded-lg p-4">
                        {answer.feedback || 'No feedback available. The AI evaluation system is currently unavailable.'}
                      </div>
                    </div>
                    
{/* Always show Ideal Answer section */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Ideal Answer:</h4>
                      <div className="text-gray-700 bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                        {answer.idealAnswer || answer.ideal_answer || 'No ideal answer available. The AI response generation is currently unavailable.'}
                      </div>
                    </div>
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

export default InterviewResult;
