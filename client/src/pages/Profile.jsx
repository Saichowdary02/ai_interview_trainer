import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../api';

const Profile = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    // Initialize form data with user info
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data.data.user;
      
      toast.success('Profile updated successfully!');
      onUpdate(updatedUser);
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Use immediate navigation to prevent seeing HomePage briefly
    window.location.href = '/login';
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setEditing(!editing)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ name: user?.name || '', email: user?.email || '' });
                  setEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="border border-gray-300 hover:bg-blue-600 hover:text-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            View Dashboard
          </button>
          <button
            onClick={() => navigate('/quiz/setup')}
            className="border border-gray-300 hover:bg-blue-600 hover:text-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Take a Quiz
          </button>
          <button
            onClick={() => navigate('/interview/setup')}
            className="border border-gray-300 hover:bg-blue-600 hover:text-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Take Interview
          </button>
          <button
            onClick={() => navigate('/ask-doubt')}
            className="border border-gray-300 hover:bg-blue-600 hover:text-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Ask a Doubt
          </button>
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About AI Interview Trainer</h2>
        <div className="space-y-4 text-gray-700">
          <p className="leading-relaxed">
            AI Interview Trainer is a comprehensive platform designed to help students and professionals 
            prepare for technical interviews and assessments through AI-powered tools and interactive learning.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 Interview Preparation</h3>
              <p className="text-sm text-gray-600">
                Practice real interview scenarios with AI-powered feedback and detailed performance analysis.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="font-semibold text-green-800 mb-2">🧠 Quiz Challenges</h3>
              <p className="text-sm text-gray-600">
                Test your knowledge with curated quizzes covering data structures, algorithms, and more.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-800 mb-2">💬 AI Study Assistant</h3>
              <p className="text-sm text-gray-600">
                Get instant help with doubts and concepts through our intelligent chatbot.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-800 mb-2">📊 Progress Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor your learning progress and identify areas for improvement.
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Built with React, Node.js, and AI technologies to provide an engaging learning experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
