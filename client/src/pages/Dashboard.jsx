import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { interviewAPI, quizAPI } from '../api';

const Dashboard = ({ user }) => {
  console.log('Dashboard component received user:', user);
  
  const [interviews, setInterviews] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch both interviews and quizzes in parallel
      const [interviewsResponse, quizzesResponse] = await Promise.all([
        interviewAPI.getHistory(),
        quizAPI.getUserQuizzes(user.id)
      ]);

      const userInterviews = interviewsResponse.data.data.interviews || [];
      const userQuizzes = quizzesResponse.data.data || [];

      setInterviews(userInterviews);
      setQuizzes(userQuizzes);

      // Calculate interview stats
      const totalInterviews = userInterviews.length;
      const averageInterviewScore = totalInterviews > 0 
        ? userInterviews.reduce((sum, interview) => sum + (interview.score || 0), 0) / totalInterviews
        : 0;
      const bestInterviewScore = totalInterviews > 0 
        ? Math.max(...userInterviews.map(interview => interview.score || 0))
        : 0;

      setStats({
        totalInterviews,
        averageScore: Math.round(averageInterviewScore * 10) / 10,
        bestScore: Math.round(bestInterviewScore * 10) / 10,
      });

      // Calculate quiz stats
      const totalQuizzes = userQuizzes.length;
      const averageQuizScore = totalQuizzes > 0 
        ? userQuizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / totalQuizzes
        : 0;
      const bestQuizScore = totalQuizzes > 0 
        ? Math.max(...userQuizzes.map(quiz => quiz.score || 0))
        : 0;

      setQuizStats({
        totalQuizzes,
        averageScore: Math.round(averageQuizScore * 10) / 10,
        bestScore: Math.round(bestQuizScore * 10) / 10,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id, fetchDashboardData]);


  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', {
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

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 font-bold';
    if (score >= 6) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Ready to practice your interview skills? Choose a difficulty level to get started.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-8 8" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-2.286 6.857M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bestScore}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizStats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-8 8" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{quizStats.averageScore}/100</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-2.286 6.857M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">{quizStats.bestScore}/100</p>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Activity */}
      {(interviews.length > 0 || quizzes.length > 0) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Interviews */}
            {interviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Interviews</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(interview.difficulty)}`}>
                          {interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Interview #{interview.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(interview.started_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-lg ${getScoreColor(interview.score)}`}>
                          {interview.score || 0}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Quizzes */}
            {quizzes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Quizzes</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {quiz.subject}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Quiz #{quiz.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(quiz.started_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-lg font-bold ${getScoreColor(quiz.score)}`}>
                          {quiz.score || 0}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timezone Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 text-center">
              ⏰ <strong>Time Display Note:</strong> Times shown are in UTC. IST (Indian Standard Time) = UTC - 5:30 hours.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
