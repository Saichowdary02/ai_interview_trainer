import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import testAPI from '../utils/apiTest';

const ApiTestPage = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const addTestResult = (testName, result) => {
    setTestResults(prev => [...prev, {
      name: testName,
      timestamp: new Date().toLocaleTimeString(),
      ...result
    }]);
  };

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    // Test 1: Basic connectivity
    addTestResult('Backend Connectivity', await testAPI.testHealth());

    // Test 2: Login with demo credentials
    addTestResult('Login Test', await testAPI.testLogin());

    // Test 3: Auth endpoints
    addTestResult('Auth Endpoints', await testAPI.testAuthEndpoints());

    setIsTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">API Backend Test</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Home
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={runTests}
              disabled={isTesting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Tests...
                </div>
              ) : (
                'Test Backend Connectivity'
              )}
            </button>
            
            {testResults.length > 0 && (
              <button
                onClick={clearResults}
                className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Clear Results
              </button>
            )}
          </div>

          {testResults.length > 0 && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      result.success
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{result.name}</h3>
                        <p className="text-sm text-gray-600">Time: {result.timestamp}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-white text-sm font-medium ${
                        result.success ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </div>
                    </div>
                    
                    {!result.success && result.error && (
                      <p className="mt-2 text-sm text-gray-700">
                        Error: {result.error}
                        {result.status && ` (Status: ${result.status})`}
                      </p>
                    )}
                    
                    {result.success && result.data && (
                      <div className="mt-2">
                        <pre className="text-sm text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to use this test:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Test Backend Connectivity" to run all tests</li>
              <li>• Green results mean the backend is working correctly</li>
              <li>• Red results indicate connection or authentication issues</li>
              <li>• Check the error messages for specific problems</li>
              <li>• After fixing the backend, refresh this page and test again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
