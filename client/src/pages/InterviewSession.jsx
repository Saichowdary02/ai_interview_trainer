import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { interviewAPI } from '../api';
import VoiceInputButton from '../components/VoiceInputButton';

const InterviewSession = ({ user }) => {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const { config } = useLocation().state || {};

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(null);

  // Submit answer function
  const handleSubmitAnswer = useCallback(async () => {
    // Prevent multiple submissions
    if (submitting) {
      console.log('Already submitting, ignoring duplicate call');
      return;
    }

    console.log('handleSubmitAnswer called, isAutoSubmitting:', !!window.isAutoSubmitting);
    
    // Get the latest answer state directly from the textarea if auto-submitting
    let currentAnswerText = '';
    const currentAnswer = answers[currentQuestionIndex];
    
    if (window.isAutoSubmitting) {
      const textarea = document.querySelector('textarea');
      currentAnswerText = textarea ? textarea.value : '';
      console.log('Auto-submit: Captured textarea value:', currentAnswerText);
    } else {
      currentAnswerText = currentAnswer?.text || '';
      console.log('Manual submit: Using state value:', currentAnswerText);
    }
    
    const currentQuestion = interview.questions[currentQuestionIndex];
    
    console.log('Current question:', currentQuestion);
    console.log('Current answer text:', currentAnswerText);
    
    // Check if answer is already submitted
    if (currentAnswer.submitted) {
      // Skip showing error message for already submitted answers
      return;
    }

    // For auto-submit from timer, allow empty answers
    // For manual submit, require an answer
    if (!window.isAutoSubmitting && (!currentAnswerText?.trim() || currentAnswerText.trim() === '')) {
      // Skip showing error message for empty answers
      return;
    }

    setSubmitting(true);
    
    // Show loading toast for submit action
    const submitToastId = toast.loading('Submitting...', {
      position: 'top-right'
    });
    
    // Pause timer at current time when user clicks submit (optimistic update)
    if (!window.isAutoSubmitting) {
      // Clear the timer interval to stop it from counting down
      if (window.clearInterviewTimer) {
        window.clearInterviewTimer();
      }
    }

    try {
      const payload = {
        questionId: currentQuestion.id,
        answerText: currentAnswerText // Use the captured text
      };

      console.log('Submitting payload:', payload);
      
      const res = await interviewAPI.submitAnswer(interviewId, payload);
      console.log('API response status:', res.status);
      console.log('API response data:', res.data);
      
      // Check if the API call was successful
      if (res.status === 200 && res.data.success) {
        const { score, feedback, ideal_answer } = res.data.data;
        
        console.log('API success response:', { score, feedback, ideal_answer });
        
        // Update the answer with score and feedback - ensure we create a new object
        const newAnswer = {
          text: currentAnswerText,
          score,
          feedback,
          idealAnswer: ideal_answer, // Use camelCase consistently
          submitted: true,
          questionId: currentQuestion.id // Ensure we track which question this answer belongs to
        };
        
        console.log('Setting submitted state for question:', currentQuestionIndex, 'Answer:', newAnswer);
        
        console.log('New answer object:', newAnswer);
        
        setAnswers(prev => {
          const newAnswers = {
            ...prev,
            [currentQuestionIndex]: newAnswer
          };
          console.log('Updated answers:', newAnswers);
          return newAnswers;
        });

        // Update toast to success for manual submissions, not auto-submits
        if (!window.isAutoSubmitting) {
          toast.success('Answer submitted!', {
            id: submitToastId,
            position: 'top-right'
          });
        } else {
          // Update toast to info for auto-submissions
          toast.info('Auto-submitting answer...', {
            id: submitToastId,
            position: 'top-right',
            duration: 1500
          });
        }

        // Check if this is the last question
        const isLastQuestion = currentQuestionIndex === interview.questions.length - 1;
        console.log('Is last question:', isLastQuestion, 'Current index:', currentQuestionIndex, 'Total questions:', interview.questions.length);
        
        if (isLastQuestion) {
          console.log('Handling last question navigation');
          // Last question - navigate to results IMMEDIATELY (no delay)
          const finalAnswers = {
            ...answers,
            [currentQuestionIndex]: newAnswer
          };
          console.log('Final answers being passed to results:', finalAnswers);
          navigate(`/interview/result/${interviewId}`, {
            state: { 
              questions: interview.questions,
              answers: finalAnswers
            }
          });
        } else {
          console.log('Moving to next question:', currentQuestionIndex + 1);
          // Not the last question - move to next question INSTANTLY
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      } else {
        // API returned unsuccessful response
        console.error('API returned unsuccessful response:', res.data);
        throw new Error(res.data.error || 'Unknown API error');
      }
    } catch (error) {
      console.error('Submit error details:', {
        message: error.message,
        stack: error.stack,
        isNetworkError: !error.response,
        response: error.response?.data
      });
      
      // Don't show error toast - just log the error and reset state
      // Users will see the loading toast remain until they try again
    } finally {
      setSubmitting(false);
      // Reset the auto-submit flag after processing
      if (window.isAutoSubmitting) {
        window.isAutoSubmitting = false;
      }
    }
  }, [answers, currentQuestionIndex, interview, navigate, submitting, interviewId]);

  const handleAnswerChange = (e) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        text: e.target.value
      }
    }));
  };

  const handleSkipQuestion = useCallback(async () => {
    const currentQuestion = interview.questions[currentQuestionIndex];
    
    // Prevent multiple submissions
    if (submitting) {
      console.log('Already submitting, ignoring duplicate skip call');
      return;
    }
    
    // Check if answer is already submitted
    const currentAnswer = answers[currentQuestionIndex];
    if (currentAnswer?.submitted) {
      console.log('Answer already submitted, ignoring skip');
      return;
    }
    
    // Set submitting state to hide buttons during skip process
    setSubmitting(true);
    
    // Show loading toast for skip action
    const skipToastId = toast.loading('Skipping...', {
      position: 'top-right'
    });
    
    // Clear the timer interval to stop it from counting down
    if (window.clearInterviewTimer) {
      window.clearInterviewTimer();
    }
    
    try {
      // Make API call to submit skipped answer
      const payload = {
        questionId: currentQuestion.id,
        answerText: '', // Empty string for skipped questions
        isSkipped: true // Flag to indicate this is a skipped question
      };

      console.log('Skipping question with payload:', payload);

      const res = await interviewAPI.submitAnswer(interviewId, payload);
      console.log('Skip question API response status:', res.status);
      console.log('Skip question API response data:', res.data);
      
      // Check if the API call was successful
      if (res.status === 200 && res.data.success) {
        // Create a skipped answer with the data from API response
        const skippedAnswer = {
          text: '',
          score: res.data.data.score || 0, // Use score from API (should be 0)
          feedback: res.data.data.feedback || 'You need to answer the question to get feedback',
          idealAnswer: res.data.data.idealAnswer || 'No ideal answer available for skipped question',
          submitted: true,
          questionId: currentQuestion.id,
          isSkipped: true
        };
        
        console.log('Creating skipped answer:', skippedAnswer);
        
        // Update answers state with new object reference
        setAnswers(prev => {
          const newAnswers = {
            ...prev,
            [currentQuestionIndex]: skippedAnswer
          };
          console.log('Updated answers after skip:', newAnswers);
          return newAnswers;
        });

        if (currentQuestionIndex < interview.questions.length - 1) {
          // Skip to next question
          setCurrentQuestionIndex(prev => {
            const newIndex = prev + 1;
            console.log('Skipping to next question:', newIndex);
            return newIndex;
          });
          // Update toast to success
          toast.success('Question skipped', {
            id: skipToastId,
            position: 'top-right'
          });
        } else {
          // Last question - navigate to results with complete data
          const finalAnswers = {
            ...answers,
            [currentQuestionIndex]: skippedAnswer
          };
          console.log('Final answers for skipped last question:', finalAnswers);
          navigate(`/interview/result/${interviewId}`, { 
            state: { 
              questions: interview.questions,
              answers: finalAnswers
            } 
          });
        }
      } else {
        // API returned unsuccessful response
        console.error('Skip question API returned unsuccessful response:', res.data);
        throw new Error(res.data.error || 'Unknown API error');
      }
    } catch (error) {
      console.error('Skip question error details:', {
        message: error.message,
        stack: error.stack,
        isNetworkError: !error.response,
        response: error.response?.data
      });
      
      // Don't show error toast - just log the error and reset state
      // Users will see the loading toast remain until they try again
    } finally {
      setSubmitting(false);
    }
  }, [answers, currentQuestionIndex, interview, interviewId, navigate, submitting]);

  // Load interview session
  useEffect(() => {
    const loadInterview = async () => {
      try {
        const res = await interviewAPI.getInterview(interviewId);
        if (res.data.success) {
          setInterview(res.data.data);
          setLoading(false);
        } else {
          throw new Error(res.data.error || 'Failed to load interview');
        }
      } catch (error) {
        console.error('Error loading interview:', error);
        setError(error.response?.data?.error || 'Failed to load interview. Please try again.');
        setLoading(false);
        toast.error('Failed to load interview', {
          position: 'top-right'
        });
        // Navigate back to dashboard after showing error
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    };
    loadInterview();
  }, [interviewId, navigate]);

  // Timer functionality - separate timer setup and reset
  useEffect(() => {
    if (!interview || !config?.timeLimit || config.timeLimit === 'nolimit') {
      setTimeLeft(null);
      if (window.clearInterviewTimer) {
        window.clearInterviewTimer();
      }
      return;
    }

    // Convert time limit to seconds
    let seconds = 0;
    switch (config.timeLimit) {
      case '30sec':
        seconds = 30;
        break;
      case '45sec':
        seconds = 45;
        break;
      case '1min':
        seconds = 60;
        break;
      case '2min':
        seconds = 120;
        break;
      default:
        setTimeLeft(null);
        return;
    }

    setTimeLeft(seconds);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        console.log('Timer tick, time left:', prev);
        // Show warning at 5 seconds remaining (only once)
        if (prev === 5) {
          console.log('Showing 5-second warning');
          toast.error('Time is running out! Last 5 seconds remaining...', {
            duration: 3000,
            position: 'top-center',
            id: 'interview-timer-warning', // Use unique ID to prevent duplicate toasts
            preventDuplicate: true
          });
        }
        
        if (prev <= 1) {
          console.log('Timer finished, triggering auto-submission');
          clearInterval(timer);
          toast.error('Time\'s up! Auto-submitting your answer...', {
            duration: 2000,
            position: 'top-center',
            id: 'auto-submit' // Use unique ID to prevent duplicate toasts
          });
          
          // Set global flag for auto-submit to allow empty answers
          window.isAutoSubmitting = true;
          
          // IMMEDIATELY trigger auto-submission without setTimeout delay
          // Use a microtask to ensure it runs after current render cycle
          queueMicrotask(() => {
            console.log('Auto-submission executed immediately');
            handleSubmitAnswer();
            // Reset the flag after submission
            window.isAutoSubmitting = false;
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clear timer function to be used by submit/skip handlers
    window.clearInterviewTimer = () => {
      clearInterval(timer);
    };

    return () => {
      clearInterval(timer);
      window.clearInterviewTimer = null;
    };
  }, [interview, config?.timeLimit, handleSubmitAnswer]); // Removed currentQuestionIndex from dependencies

  // Reset timer when question changes - this should trigger timer reset
  useEffect(() => {
    if (interview && config?.timeLimit && config.timeLimit !== 'nolimit') {
      let seconds = 0;
      switch (config.timeLimit) {
        case '30sec':
          seconds = 30;
          break;
        case '45sec':
          seconds = 45;
          break;
        case '1min':
          seconds = 60;
          break;
        case '2min':
          seconds = 120;
          break;
        default:
          seconds = 60; // fallback to 1 minute
          break;
      }
      
      // Clear any existing timer before setting new time
      if (window.clearInterviewTimer) {
        window.clearInterviewTimer();
      }
      
      setTimeLeft(seconds);
      console.log('Timer reset to:', seconds, 'seconds for question:', currentQuestionIndex);
    }
  }, [currentQuestionIndex, interview, config?.timeLimit]);

  // Early return for loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading interview session...</p>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Interview</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Early return if interview data is not available
  if (!interview || !interview.questions || interview.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Interview Data</h2>
          <p className="text-gray-600 mb-6">The interview session could not be loaded. Please try again.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Debug the current answer state
  const currentQuestion = interview.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex] || {};
  
  console.log('Current answer for question', currentQuestionIndex, ':', currentAnswer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Question {currentQuestionIndex + 1} of {interview.questions.length}
              </h2>
              <p className="text-gray-600 mt-1">
                Subject: {config?.subject || 'Unknown'}
              </p>
            </div>
          </div>
          
          {/* Timer Display - Only show when not submitted (visible during submission) */}
          {config?.timeLimit && config.timeLimit !== 'nolimit' && timeLeft !== null && !currentAnswer.submitted && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Time Remaining:</span>
                <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                  {timeLeft} seconds
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    timeLeft <= 5 ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${(timeLeft / (config.timeLimit === '30sec' ? 30 : config.timeLimit === '45sec' ? 45 : config.timeLimit === '1min' ? 60 : 120)) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
          
          {/* No Limit Display */}
          {config?.timeLimit === 'nolimit' && !currentAnswer.submitted && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <span className="text-lg font-medium text-gray-700">Time Limit: No Limit</span>
              </div>
            </div>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.content}
          </h3>
          
          {/* Answer Input */}
          <div className="mb-6">
            <div className="flex flex-col space-y-4">
              <textarea
                rows="8"
                value={currentAnswer.text || ''}
                onChange={handleAnswerChange}
                placeholder="Type your answer here..."
                disabled={currentAnswer.submitted}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              
              {/* Voice Input Button */}
              <div className="flex justify-center">
                <VoiceInputButton 
                  key={`voice-input-${currentQuestionIndex}`}
                  onTextChange={(text, mode) => {
                    setAnswers(prev => {
                      const currentText = prev[currentQuestionIndex]?.text || '';
                      const newText = mode === 'append' && currentText ? currentText + ' ' + text : text;
                      return {
                        ...prev,
                        [currentQuestionIndex]: {
                          ...prev[currentQuestionIndex],
                          text: newText
                        }
                      };
                    });
                  }}
                  disabled={currentAnswer.submitted}
                  mode="append"
                />
              </div>
            </div>
          </div>

          {/* Submit and Skip Buttons - Only show when not submitting and not submitted */}
          {!(submitting || currentAnswer.submitted) && (
            <div className="flex space-x-4">
              <button
                onClick={handleSubmitAnswer}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Submit Answer
              </button>

              <button
                onClick={handleSkipQuestion}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Skip Question
              </button>
            </div>
          )}

          {/* Note about AI feedback and ideal answer generation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Note:</strong> Submission of this question may take some time due to AI feedback and ideal answer generation. Please stay patient while the system processes your answer.
            </p>
          </div>
        </div>

        {/* AI Feedback and Score - Removed to show only at results page */}

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {currentQuestionIndex + 1} / {interview.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
