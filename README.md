# AI Interview Trainer

A comprehensive full-stack web application that helps users practice both technical interviews and quizzes using AI-powered feedback, scoring, and voice input capabilities.

## 🚀 Features

### 🎯 Interview System
- **AI-Powered Interviews**: Real-time technical interviews with AI feedback and scoring
- **Voice Input**: Speech recognition for answering questions naturally
- **Multiple Difficulty Levels**: Easy, Medium, and Hard interview questions
- **Interview History**: Track and review past interview sessions
- **Performance Analytics**: View scores and detailed AI-generated feedback

### 📝 Quiz System  
- **Multiple Choice Quizzes**: Interactive quiz system with timed questions
- **Auto-Submit Functionality**: Automatic question progression with timer
- **Instant Results**: Immediate grading and feedback
- **Quiz History**: Track completed quizzes and performance

### 🔐 Authentication & Security
- **User Authentication**: Secure registration and login with JWT tokens
- **Profile Management**: User profile viewing and editing capabilities
- **Local Development**: Everything runs locally - no cloud deployment required

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** for data storage
- **OpenAI API** for AI feedback generation
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React 18** with functional components and hooks
- **React Router** for client-side routing
- **TailwindCSS** for utility-first styling
- **React Hot Toast** for user notifications
- **Web Speech API** for voice input/output
- **Axios** for API communication

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (local installation)
- **OpenAI API Key** (for AI feedback)

## 🚀 Running the Application

### Local Development

1. **Start the Backend Server:**
   ```bash
   cd server
   npm start
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend:**
   ```bash
   cd client
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Deployment

The application automatically detects the environment and uses the correct API endpoints:

- **Local Development**: Automatically uses `http://localhost:5000/api`
- **Production**: Uses `https://ai-interview-trainer-server.onrender.com/api`

### Environment Configuration

The frontend automatically configures itself based on the environment:

1. **Local Development**: 
   - Automatically detects `localhost` or `127.0.0.1`
   - Uses local backend at `http://localhost:5000/api`
   - No additional configuration needed

2. **Production**:
   - Uses production backend URL
   - No additional configuration needed

3. **Custom Configuration**:
   - Create `client/.env.local` file
   - Set `REACT_APP_API_BASE_URL=your_custom_api_url`

## 🚀 Quick Start

### 1. Database Setup

1. **Install PostgreSQL** locally if not already installed
2. **Create a database** named `ai_interview_trainer`
3. **Update database credentials** in `server/.env`

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # (if exists) or edit .env directly

# Update .env with your credentials:
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your_jwt_secret
# OPENAI_API_KEY=your_openai_api_key

# Set up database and tables
node setupDatabase.js

# Start the server
npm start
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

## 📖 API Documentation

### Authentication

- **POST** `/api/auth/signup` - Register a new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/profile` - Get user profile (protected)
- **PUT** `/api/auth/profile` - Update user profile (protected)
- **PUT** `/api/auth/change-password` - Change password (protected)

### Interview System

- **POST** `/api/interview/start` - Start a new interview (protected)
- **GET** `/api/interview/:id/questions` - Get questions for interview (protected)
- **POST** `/api/interview/:id/submit-answer` - Submit answer and get AI feedback (protected)
- **GET** `/api/interview/:id/results` - Get interview results (protected)
- **GET** `/api/interview/history` - Get user's interview history (protected)

### Quiz System

- **POST** `/api/quizzes/create` - Create a new quiz (protected)
- **GET** `/api/quizzes/:id/questions` - Get quiz questions (protected)
- **POST** `/api/quizzes/:id/submit-answer` - Submit quiz answer (protected)
- **GET** `/api/quizzes/:id/results` - Get quiz results (protected)
- **GET** `/api/quizzes/history` - Get user's quiz history (protected)

### Questions & Answers

- **GET** `/api/questions` - Get all questions
- **GET** `/api/questions/:difficulty` - Get questions by difficulty
- **GET** `/api/questions/:subject/:difficulty` - Get questions by subject and difficulty
- **POST** `/api/questions` - Add new question (protected)
- **PUT** `/api/questions/:id` - Update question (protected)
- **DELETE** `/api/questions/:id` - Delete question (protected)

### Answers

- **GET** `/api/answers/:id` - Get answer details (protected)
- **PUT** `/api/answers/:id/feedback` - Update feedback (protected)
- **GET** `/api/answers/interview/:id` - Get answers for interview (protected)
- **GET** `/api/answers/quiz/:id` - Get answers for quiz (protected)
- **DELETE** `/api/answers/:id` - Delete answer (protected)

## 🎯 Usage

### Interview Mode
1. **Register/Login**: Create an account or log in
2. **Start Interview**: Choose difficulty level (easy, medium, hard) and topics
3. **Answer Questions**: Use voice input or text to answer technical questions
4. **Get AI Feedback**: Receive real-time scoring and detailed feedback
5. **Review Results**: See your performance analytics and improvement areas

### Quiz Mode  
1. **Create Quiz**: Choose quiz parameters (difficulty, number of questions)
2. **Take Quiz**: Answer multiple choice questions with timer
3. **Auto-Progress**: Questions automatically advance when time expires
4. **Instant Results**: Get immediate grading and feedback
5. **Track Performance**: Monitor your quiz history and progress

### General Features
- **Profile Management**: Update your information and preferences
- **History Tracking**: Review past interviews and quizzes
- **Performance Analytics**: Monitor your improvement over time

## 📊 Database Schema

### Core Tables

- **users**: User accounts with hashed passwords and profile information
- **interviews**: Interview sessions with difficulty, duration, and final scores
- **quizzes**: Quiz sessions with configuration and completion status
- **questions**: Questions for both interviews and quizzes, categorized by difficulty and subject
- **answers**: User responses with scoring, AI feedback, and timestamps
- **quiz_answers**: Quiz-specific responses with selected options and correctness

### Supporting Tables

- **mcq_questions**: Multiple choice questions with answer options
- **interview_questions**: Interview questions with ideal answers for AI evaluation


## 📝 Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=ai_interview_trainer
DB_PASSWORD=your_password_here
DB_PORT=5432
JWT_SECRET=your_jwt_secret_here_change_this_to_something_random_and_secure
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

## 🚀 Deployment

### Development Mode

```bash
# Start backend
cd server && npm start

# Start frontend  
cd client && npm start
```

### Production Mode

```bash
# Build frontend
cd client && npm run build

# Start production backend
cd server && npm start
```

### Production Considerations

1. **Set up a production database** (PostgreSQL)
2. **Configure environment variables** for production
3. **Use a process manager** like PM2 for the backend
4. **Serve the frontend** using Nginx or similar static server
5. **Set up HTTPS** for secure communication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the existing issues
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🎉 Acknowledgments

- OpenAI for the GPT models that power the AI feedback
- PostgreSQL for reliable data storage
- React and Node.js communities for excellent frameworks

## 🎉 What's New

- ✨ **Quiz System**: Complete multiple choice quiz functionality with timers
- 🎙️ **Voice Input**: Speech recognition for natural question answering  
- 📊 **Enhanced Analytics**: Detailed performance tracking for both interviews and quizzes
- 🔐 **Improved Security**: JWT-based authentication with secure password hashing
- 📱 **Responsive Design**: Mobile-friendly interface using Tailwind CSS

---

**Happy Coding and Good Luck with Your Interviews and Quizzes!** 🚀
