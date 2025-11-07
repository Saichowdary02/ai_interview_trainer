import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
import { quizAPI } from "../api";

const QuizPlayer = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerDuration, setTimerDuration] = useState(15);
  const [hurryUpToastShown, setHurryUpToastShown] = useState(false);

  // Initialize quiz
  useEffect(() => {
    if (state && state.questions && state.questions.length > 0) {
      setQuestions(state.questions);
      setTimerDuration(Number(state.timer) || 15);
      setTimeLeft(Number(state.timer) || 15);
    }
  }, [state]);

  // Start timer when question changes
  useEffect(() => {
    let timer;
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          // Check for hurry up toast when timer reaches 5 seconds
          if (prev === 5 && !hurryUpToastShown) {
            // Use setTimeout to avoid state update during render
            setTimeout(() => {
              toast.loading("⏰ Hurry up! Last 5 seconds remaining!");
              setHurryUpToastShown(true);
            }, 0);
          }
          
          if (prev <= 1) {
            clearInterval(timer);
            // Use setTimeout to avoid state update during render
            setTimeout(() => {
              handleTimeUp(); // Timer complete - handle autosubmit or skip
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentQuestionIndex, questions.length]);

  // Submit answer and move to next question
  const handleSubmit = async () => {
    if (!selectedOption) return;

    try {
      const question = questions[currentQuestionIndex];
      await quizAPI.submitAnswer(quizId, {
        questionId: question.id,
        selectedOption: selectedOption,
      });
      toast.success("Answer submitted!");
      moveToNextQuestion();
    } catch (err) {
      toast.error("Failed to submit answer. Please try again.");
      console.error("Failed to submit answer:", err);
    }
  };

  // Clear selected answer
  const handleClear = () => {
    setSelectedOption("");
    toast.success("Answer cleared!");
  };

  // Skip question and move to next
  const handleSkip = async () => {
    try {
      const question = questions[currentQuestionIndex];
      const token = localStorage.getItem('token');
      console.log('Skipping question:', { 
        quizId, 
        questionId: question.id, 
        selectedOption: "skipped",
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
      });
      
      // Test server connectivity first
      if (!navigator.onLine) {
        throw new Error("No internet connection");
      }
      
      const response = await quizAPI.submitAnswer(quizId, {
        questionId: question.id,
        selectedOption: "skipped",
      });
      
      console.log('Skip response:', response);
      toast.success("Question skipped!");
      moveToNextQuestion();
    } catch (err) {
      console.error("Failed to skip question:", err);
      console.error("Axios error details:", {
        message: err.message,
        name: err.name,
        code: err.code,
        response: err.response,
        request: err.request,
        config: err.config,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data
      });
      
      if (err.response) {
        const errorMsg = err.response.data?.message || err.response.data?.error || 'Server error';
        toast.error(`Failed to skip question: ${errorMsg}`);
        
        // If 401 error, redirect to login
        if (err.response.status === 401) {
          toast.error("Session expired. Please login again.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (err.response.status === 404) {
          toast.error("Quiz not found. Please restart the quiz.");
        } else if (err.response.status >= 500) {
          toast.error("Server error. Please try again later.");
        }
      } else if (err.request) {
        console.error("Network request details:", {
          readyState: err.request.readyState,
          status: err.request.status,
          statusText: err.request.statusText,
          responseURL: err.request.responseURL
        });
        
        toast.error("Failed to connect to server. Please check your internet connection.");
      } else {
        toast.error("Failed to skip question: Invalid request configuration");
      }
    }
  };

  // Handle timer expiration - autosubmit marked answer or skip
  const handleTimeUp = async () => {
    try {
      const question = questions[currentQuestionIndex];
      
      if (selectedOption) {
        // User has marked an answer - submit it
        await quizAPI.submitAnswer(quizId, {
          questionId: question.id,
          selectedOption: selectedOption,
        });
        toast.success("Answer submitted automatically!");
      } else {
        // No answer marked - skip the question
        await quizAPI.submitAnswer(quizId, {
          questionId: question.id,
          selectedOption: "skipped",
        });
        toast.info("Question skipped due to time limit!");
      }
    } catch (err) {
      console.error("Failed to submit answer on timer expiration:", err);
      // Still move to next question even if submission fails
    }
    
    // Always move to next question after timer expires
    moveToNextQuestion();
  };

  // Move to next question
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      navigate(`/quiz/results/${quizId}`);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption("");
      setTimeLeft(timerDuration);
      setHurryUpToastShown(false); // Reset hurry up toast flag for next question
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;

  // Loading state if no current question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Q {currentQuestionIndex + 1} of {questions.length}
            </p>
            <p
              className={`text-lg font-semibold ${
                timeLeft <= 10 ? "text-red-600" : "text-blue-600"
              }`}
            >
              {timeLeft}s left
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.content}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options &&
              Object.entries(currentQuestion.options).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === key
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="option"
                    value={key}
                    checked={selectedOption === key}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        selectedOption === key
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedOption === key && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{value}</span>
                  </div>
                </label>
              ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setSelectedOption("")}
              disabled={!selectedOption}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Clear
            </button>

            <button
              onClick={handleSkip}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ⏭️ Skip
            </button>

            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Submit
            </button>
          </div>

          {/* Note about answer submission */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Note: Answers are submitted when you click Submit. Timer expiration automatically submits marked answers or skips unanswered questions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;
