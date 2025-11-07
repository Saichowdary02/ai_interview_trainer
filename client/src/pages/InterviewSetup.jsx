import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { interviewAPI } from "../api";

const InterviewSetup = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Interview configuration state
  const [config, setConfig] = useState({
    difficulty: "easy", // Default difficulty
    subject: "",
    questionCount: 5,
    timeLimit: "nolimit", // nolimit, 30sec, 45sec, 1min, 2min
  });

  // Set difficulty from location state if provided
  useEffect(() => {
    if (location.state?.difficulty) {
      setConfig(prev => ({
        ...prev,
        difficulty: location.state.difficulty
      }));
    }
  }, [location.state?.difficulty]);

  // Subjects based on database - same subjects for all difficulty levels
  const subjects = {
    easy: ["Data Structures", "DBMS", "Operating Systems", "Computer Networks", "OOPs", "Java", "Python", "HTML & CSS", "JavaScript", "React.js", "Node.js & Express.js", "Human Resources"],
    medium: ["Data Structures", "DBMS", "Operating Systems", "Computer Networks", "OOPs", "Java", "Python", "HTML & CSS", "JavaScript", "React.js", "Node.js & Express.js", "Human Resources"],
    difficult: ["Data Structures", "DBMS", "Operating Systems", "Computer Networks", "OOPs", "Java", "Python", "HTML & CSS", "JavaScript", "React.js", "Node.js & Express.js", "Human Resources"],
  };

  // Time limit options
  const timeOptions = [
    { value: "nolimit", label: "No Time Limit" },
    { value: "30sec", label: "30 seconds/question" },
    { value: "45sec", label: "45 seconds/question" },
    { value: "1min", label: "1 minute/question" },
    { value: "2min", label: "2 minutes/question" },
  ];

  // Handle configuration updates
  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!config.subject) {
      toast.error("Please select a subject");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting enhanced interview setup with:", config);

      const response = await interviewAPI.setupInterview({
        difficulty: config.difficulty,
        subject: config.subject,
        questionCount: parseInt(config.questionCount),
        timeLimit: config.timeLimit,
        inputType: "text", // Default input type
      });

      if (response.data.success) {
        toast.success("Interview setup complete!");

        navigate(`/interview/session/${response.data.data.interviewId}`, {
          state: { 
            config,
            questions: response.data.data.questions 
          },
        });
      } else {
        toast.error("Failed to setup interview. Please try again.");
      }
    } catch (error) {
      console.error("Interview setup failed:", error);
      // Show more specific error message
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to setup interview. Please check your internet connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Setup Your Interview</h1>
          <p className="text-gray-600">
            Difficulty: <span className="font-semibold capitalize">{config.difficulty}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Difficulty
            </label>
            <select
              value={config.difficulty}
              onChange={(e) => handleConfigChange("difficulty", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="difficult">difficult</option>
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject
            </label>
            <select
              value={config.subject}
              onChange={(e) => handleConfigChange("subject", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Choose a subject...</option>
              {subjects[config.difficulty]?.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <select
              value={config.questionCount}
              onChange={(e) => handleConfigChange("questionCount", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Array.from({ length: 11 }, (_, i) => i + 5).map((count) => (
                <option key={count} value={count}>
                  {count} questions
                </option>
              ))}
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit per Question
            </label>
            <select
              value={config.timeLimit}
              onChange={(e) => handleConfigChange("timeLimit", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {timeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>


          {/* Configuration Summary */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Interview Summary:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                <strong>Subject:</strong> {config.subject || "Not selected"}
              </li>
              <li>
                <strong>Questions:</strong> {config.questionCount}
              </li>
              <li>
                <strong>Time Limit:</strong>{" "}
                {timeOptions.find((t) => t.value === config.timeLimit)?.label}
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !config.subject}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Setting Up...
                </div>
              ) : (
                "Start Interview"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewSetup;
