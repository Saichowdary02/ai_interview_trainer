import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizAPI } from "../api";

const QuizResults = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0,
    subject: "Unknown",
    difficulty: "Unknown",
  });
  const [expanded, setExpanded] = useState(new Set());

  // Fetch quiz results
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await quizAPI.getQuizResults(quizId);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to load results");
      }

      const payload = response.data.data;
      if (!Array.isArray(payload) || payload.length === 0) {
        throw new Error("No results found for this quiz.");
      }

      const totalQuestions = Number(payload[0]?.total_questions || payload.length);
      const score = Number(payload[0]?.score || 0);
      const subject = payload[0]?.subject || "Unknown";
      const difficulty = payload[0]?.difficulty || "Unknown";

      const normalized = payload.map((r) => ({
        question_id: r.question_id,
        content: r.content || "(No question text)",
        options: typeof r.options === "object" ? r.options : {},
        correct_option: r.correct_option,
        selected_option: r.selected_option || "skipped",
        explanation: r.explanation || "",
        is_correct: !!r.is_correct,
        question_order: r.question_order || 1,
      }));

      // Sort by question_order to ensure correct sequence
      normalized.sort((a, b) => (a.question_order || 0) - (b.question_order || 0));

      const correctAnswers = normalized.filter((r) => r.is_correct).length;

      setResults(normalized);
      setSummary({
        totalQuestions,
        correctAnswers,
        score,
        subject,
        difficulty,
      });
    } catch (err) {
      console.error("Fetch results error:", err);
      setError(err.message || "Failed to fetch results.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults, quizId]);

  const toggleExpand = (qid) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(qid) ? next.delete(qid) : next.add(qid);
      return next;
    });
  };

  const handleTryAgain = () => navigate("/quiz/setup");
  const handleViewHistory = () => navigate("/dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={handleTryAgain}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { totalQuestions, correctAnswers, score, subject, difficulty } = summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Completed!
          </h1>
          <p className="text-gray-600">
            {subject} ({difficulty})
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
              <p className="text-gray-600 text-sm">Total</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
              <p className="text-gray-600 text-sm">Correct</p>
            </div>
            <div>
              <p
                className={`text-3xl font-bold ${
                  score >= 70
                    ? "text-green-600"
                    : score >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {Math.round(score)}%
              </p>
              <p className="text-gray-600 text-sm">Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">
                {Math.max(totalQuestions - correctAnswers, 0)}
              </p>
              <p className="text-gray-600 text-sm">Incorrect</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Question Details
          </h2>

          <div className="space-y-4">
            {results.map((q, idx) => {
              const isExpanded = expanded.has(q.question_id);
              const userAns = q.selected_option || "skipped";
              return (
                <div
                  key={q.question_id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(q.question_id)}
                    className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 font-bold ${
                          q.is_correct
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {q.is_correct ? "✓" : "✗"}
                      </div>
                      <span className="font-medium text-gray-800">
                        Q{idx + 1}: {q.content.length > 100
                          ? q.content.slice(0, 100) + "..."
                          : q.content}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-3">
                      <p className="text-gray-800 font-semibold">Question:</p>
                      <p className="text-gray-700">{q.content}</p>

                      {q.options && Object.keys(q.options).length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-800 mb-2">
                            Options:
                          </p>
                          {Object.entries(q.options).map(([key, val]) => (
                            <div
                              key={key}
                              className={`p-2 rounded border mb-1 ${
                                key === q.correct_option
                                  ? "bg-green-100 border-green-400"
                                  : key === userAns && !q.is_correct
                                  ? "bg-red-100 border-red-400"
                                  : "border-gray-200"
                              }`}
                            >
                              <span className="font-medium mr-2">{key}:</span>
                              {val}
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="font-semibold text-gray-800 mt-2">
                        Your Answer:
                      </p>
                      <p
                        className={`font-medium ${
                          q.is_correct
                            ? "text-green-600"
                            : userAns === "skipped"
                            ? "text-gray-500"
                            : "text-red-600"
                        }`}
                      >
                        {userAns === "skipped"
                          ? "Skipped"
                          : `${userAns}: ${q.options?.[userAns] || ""}`}
                      </p>

                      {q.explanation && (
                        <div className="mt-3 bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                          <p className="text-blue-800 text-sm">
                            💡 {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={handleTryAgain}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🚀 Try Another Quiz
          </button>
          <button
            onClick={handleViewHistory}
            className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            📊 View Quiz History
          </button>
        </div>

        <div className="text-center mt-6 text-gray-500">
          💡 Keep practicing to improve your score!
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
