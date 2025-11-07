import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-12 px-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Welcome to <span className="text-blue-600">AI Interview Trainer</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8 text-center">
          Boost your interview performance with our intelligent AI-powered interview trainer. 
          Practice real-world technical interviews, get instant AI feedback, and improve your 
          confidence and skills.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
<Link to="/quiz/setup">
            <button className="bg-transparent hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
              Take a Quiz
            </button>
          </Link>
          <Link to="/interview/setup">
            <button className="bg-transparent hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
              Take an Interview
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose <span className="text-blue-600">AI Interview Trainer?</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">AI-Powered</h3>
              <p className="text-gray-600 text-sm">Advanced AI algorithms provide realistic interview simulations and instant feedback.</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Track Progress</h3>
              <p className="text-gray-600 text-sm">Monitor your improvement over time with detailed analytics and performance metrics.</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Customized</h3>
              <p className="text-gray-600 text-sm">Personalized questions based on your selected course and difficulty level.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Benefit Section */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Who Can Benefit?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Students & Freshers",
                text: "Prepare for placement drives and technical interviews with confidence.",
              },
              {
                title: "Job Seekers",
                text: "Sharpen your technical and behavioral interview skills with real-time feedback.",
              },
              {
                title: "Professionals",
                text: "Enhance your problem-solving and communication skills for career advancement.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-3">
                  {idx === 0 ? '🎓' : idx === 1 ? '💼' : '👔'}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-6 bg-blue-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="mb-6 opacity-90">
            Join thousands of successful candidates who have improved their interview skills with our AI-powered platform.
          </p>
<button 
          onClick={scrollToTop}
          className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          Get Started Now
        </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-4">
        <p>© {new Date().getFullYear()} AI Interview Trainer. All rights reserved.</p>
      </footer>
    </div>
  );
}
