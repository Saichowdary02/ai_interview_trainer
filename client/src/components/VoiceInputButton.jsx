import React, { useState, useRef, useEffect } from 'react';

const VoiceInputButton = ({ onTextChange, disabled = false, mode = 'replace' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const [isSecureContext, setIsSecureContext] = useState(true);

  // Check browser support for Web Speech API and secure context
  useEffect(() => {
    // Check if running in a secure context (HTTPS or localhost)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    setIsSecureContext(isSecure);
    
    if (!isSecure) {
      setIsSupported(false);
      setError('Speech recognition requires a secure connection (HTTPS). Please access this site using HTTPS.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome for the best experience.');
    }
  }, []);

  const startListening = async () => {
    if (!isSupported || disabled || !isSecureContext) return;

    try {
      // Check microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError('Speech recognition is not supported in this browser. Please use Chrome for the best experience.');
        return;
      }
      
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognition result:', transcript);
          onTextChange(transcript, mode);
          setIsListening(false);
          setError(null);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error, event);
          setIsListening(false);
          
          switch (event.error) {
            case 'no-speech':
              setError('No speech detected. Please speak clearly and try again.');
              break;
            case 'audio-capture':
              setError('Microphone not accessible. Please check your microphone permissions in browser settings.');
              break;
            case 'not-allowed':
            case 'permission-denied':
              setError('Microphone access denied. Please allow microphone access in your browser settings.');
              break;
            case 'not-found':
              setError('No microphone found. Please connect a microphone and try again.');
              break;
            case 'network':
              setError('Speech recognition temporarily unavailable. This may be due to browser limitations in production environments. Try refreshing the page, using Chrome browser, or use manual input.');
              console.warn('Speech Recognition API network error - this is a known limitation with some browsers in production environments');
              break;
            case 'service-not-allowed':
              setError('Speech recognition service not available. Please check your browser settings or use manual input.');
              break;
            case 'aborted':
              setError('Speech recognition was stopped. Please try again if needed.');
              break;
            case 'language-not-supported':
              setError('Language not supported. Please try speaking in English.');
              break;
            default:
              setError(`Speech recognition error: ${event.error}. Please try again or use manual input.`);
              console.log('Additional error details:', event);
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
        };
      }

      // Add a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (isListening && recognitionRef.current) {
          console.warn('Speech recognition timeout - stopping to prevent hanging');
          recognitionRef.current.stop();
          setIsListening(false);
          setError('Speech recognition timed out. Please try again.');
        }
      }, 10000); // 10 second timeout

      setIsListening(true);
      setError(null);
      recognitionRef.current.start();
      
      // Store timeout reference for cleanup
      recognitionRef.current.timeoutId = timeoutId;
      
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      
      if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.message.includes('device')) {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotSupportedError' || err.message.includes('support')) {
        setError('Microphone not supported in this browser. Please use Chrome for the best experience.');
      } else if (err.message.includes('HTTPS') || err.message.includes('secure')) {
        setError('Speech recognition requires a secure connection. Please access this site using HTTPS.');
      } else {
        setError('Failed to start speech recognition. Please try again or use manual input.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        // Clear timeout if it exists
        if (recognitionRef.current.timeoutId) {
          clearTimeout(recognitionRef.current.timeoutId);
        }
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="text-center py-4">
        <div className="text-red-600 text-sm font-medium mb-2">⚠️ Browser Not Supported</div>
        <div className="text-gray-600 text-xs">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`
          relative p-3 rounded-full transition-all duration-200 
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-300
        `}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span className="text-sm font-medium">🎤 Voice</span>
          </div>
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-1">
          {error}
        </div>
      )}
      
      <div className="text-gray-500 text-xs text-center px-2">
        Click 🎤 and start speaking your answer
      </div>
    </div>
  );
};

export default VoiceInputButton;
