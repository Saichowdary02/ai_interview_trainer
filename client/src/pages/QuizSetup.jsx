import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../api";

const QuizSetup = ({ user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "Data Structures",
    difficulty: "easy",
    numQuestions: 5,
    timer: 30,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subjects = [
    "Data Structures",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "OOPs",
    "Java",
    "Python",
    "HTML & CSS",
    "JavaScript",
    "React.js",
    "Node.js & Express.js",
  ];

  const difficulties = ["easy", "medium", "difficult"];
  const timers = [15, 30, 45, 60];
  const questionCounts = Array.from({ length: 11 }, (_, i) => i + 5); // 5–15

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["numQuestions", "timer"].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user?.id) {
      setError("User not authenticated. Please log in first.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        userId: user.id,
        subject: formData.subject,
        difficulty: formData.difficulty,
        numQuestions: formData.numQuestions,
        timer: formData.timer,
      };

      const res = await quizAPI.start(payload);

      if (res?.data?.success) {
        const { quiz, questions, timer } = res.data.data;

        if (!quiz?.id || !Array.isArray(questions)) {
          throw new Error("Invalid quiz data from server");
        }

        navigate(`/quiz/play/${quiz.id}`, {
          state: {
            questions,
            timer: Number(timer),
          },
        });
      } else {
        throw new Error(res?.data?.message || "Failed to start quiz");
      }
    } catch (err) {
      console.error("Quiz start error:", err);
      setError(err.message || "Something went wrong while starting the quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 AI Interview Quiz
          </h1>
          <p className="text-gray-600 text-lg">
            Test your skills with timed multiple-choice questions.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Configure Your Quiz
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions *
              </label>
              <select
                name="numQuestions"
                value={formData.numQuestions}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {questionCounts.map((count) => (
                  <option key={count} value={count}>
                    {count} questions
                  </option>
                ))}
              </select>
            </div>

            {/* Timer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timer per Question *
              </label>
              <select
                name="timer"
                value={formData.timer}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timers.map((t) => (
                  <option key={t} value={t}>
                    {t} seconds
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Starting...
                  </div>
                ) : (
                  "🚀 Start Quiz"
                )}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="font-semibold text-green-600">Easy</div>
              <div className="text-sm text-green-500">
                Basic concepts and fundamentals
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <div className="font-semibold text-yellow-600">Medium</div>
              <div className="text-sm text-yellow-500">
                Moderate difficulty questions
              </div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <div className="font-semibold text-red-600">Difficult</div>
              <div className="text-sm text-red-500">
                Advanced and tricky questions
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          💡 Tip: Read questions carefully and manage your time wisely!
        </div>
      </div>
    </div>
  );
};

export default QuizSetup;
