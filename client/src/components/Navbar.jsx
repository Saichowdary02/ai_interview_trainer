import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Interview Trainer</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  to="/interview/setup"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Interview
                </Link>
                <Link
                  to="/quiz/setup"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                 Quiz
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Profile
                </Link>
<Link
                  to="/ask-doubt"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Ask a Doubt
                </Link>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium text-sm">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-1"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-1"
            >
              Dashboard
            </Link>
            <Link
              to="/interview/setup"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-1"
            >
              Interview
            </Link>
            <Link
              to="/quiz/setup"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-1"
            >
               Quiz
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-1"
            >
              Profile
            </Link>
<Link
              to="/ask-doubt"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-1"
            >
              Ask a Doubt
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
