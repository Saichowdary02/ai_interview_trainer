import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import Interview from './pages/Interview';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import InterviewResultAPI from './pages/InterviewResultAPI';
import Profile from './pages/Profile';
import QuizSetup from './pages/QuizSetup';
import QuizPlayer from './pages/QuizPlayer';
import QuizResults from './pages/QuizResults';
import AskDoubt from './pages/AskDoubt';
import api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.data.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    const userToSet = userData.user || userData;
    setUser(userToSet);
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={logout} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!user ? <Login onLogin={login} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup onLogin={login} /> : <Navigate to="/" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/interview"
            element={user ? <Interview user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/interview/setup"
            element={user ? <InterviewSetup user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/interview/session/:interviewId"
            element={user ? <InterviewSession user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/interview/result/:interviewId"
            element={user ? <InterviewResultAPI user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} onUpdate={setUser} /> : <Navigate to="/login" replace />}
          />

          {/* Quiz Routes */}
          <Route
            path="/quiz/setup"
            element={user ? <QuizSetup user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/quiz/play/:quizId"
            element={user ? <QuizPlayer /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/quiz/results/:quizId"
            element={user ? <QuizResults /> : <Navigate to="/login" replace />}
          />

          {/* Default Route */}
          <Route
            path="/"
            element={user ? <HomePage user={user} /> : <Navigate to="/login" replace />}
          />
          
          {/* Ask Doubt Route */}
          <Route
            path="/ask-doubt"
            element={user ? <AskDoubt user={user} /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          error: {
            duration: 3000,
            style: {
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              fontSize: '16px',
              fontWeight: '500',
              borderRadius: '8px',
              maxWidth: '400px',
            },
          },
          success: {
            duration: 5000,
            style: {
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              fontSize: '16px',
              fontWeight: '500',
              borderRadius: '8px',
              maxWidth: '400px',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
