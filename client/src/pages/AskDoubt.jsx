import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { studyChatAPI } from '../api';

const AskDoubt = () => {
  const { loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I’m StudyBot, your personal AI study assistant. I can help you with questions on: Data Structures, DBMS, Operating Systems, Computer Networks, OOPs, Java, Python, HTML & CSS, JavaScript, React.js, Node.js & Express.js, and Human Resources.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await studyChatAPI.sendMessage({ messages: [...messages, userMessage] });
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-purple-800 px-6 py-3 rounded-full text-sm font-semibold mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>AI-Powered Study Assistant</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ask a Doubt
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Your personal AI chatbot to help clarify concepts and answer study questions with intelligent, real-time assistance
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl h-[80vh] flex flex-col border-2 border-gradient-to-r from-blue-200 to-purple-200 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md lg:max-w-lg px-6 py-4 rounded-3xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white transform translate-x-2'
                      : 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-900 transform -translate-x-2'
                  }`}
                >
                  <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                  <p
                    className={`text-xs mt-3 font-medium ${
                      message.role === 'user' ? 'text-blue-100 opacity-90' : 'text-green-600'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 text-gray-900 max-w-md lg:max-w-lg px-6 py-5 rounded-3xl shadow-lg border border-orange-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-4 h-4 bg-orange-400 rounded-full animate-bounce"></div>
                      <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-orange-600 font-medium">StudyBot is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-gradient-to-r from-blue-50 to-purple-50 p-8">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type your study question here..."
                  className="w-full border-2 border-blue-200 rounded-2xl px-6 py-4 pl-6 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 text-base placeholder-gray-500 shadow-lg"
                  disabled={isTyping}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 1.66-4 3-9 3s-9-1.34-9-3c0-1.66 4-3 9-3s9 1.34 9 3z" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-base">Send</span>
                </div>
              </button>
            </form>
            
            {/* Study Topics Help */}
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
              <p className="text-sm text-green-800 text-center font-medium leading-relaxed">
                <span className="block font-bold text-green-900 text-base mb-2">Available Subjects:</span>
                Data Structures, DBMS, Operating Systems, Computer Networks, OOPs, Java, Python, HTML & CSS, JavaScript, React.js, Node.js & Express.js, Human Resources
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskDoubt;
