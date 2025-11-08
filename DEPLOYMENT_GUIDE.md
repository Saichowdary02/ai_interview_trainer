# AI Interview Trainer - Deployment Guide

## Overview
This application uses a **separate frontend and backend deployment** strategy:
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: Neon PostgreSQL

## Backend Deployment (Render)

### Step 1: Environment Variables on Render
Set these environment variables in your Render dashboard:

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database (Neon) - Use your actual Neon connection string
DATABASE_URL=postgresql://neondb_owner:npg_mV4zfgXrqv6T@ep-empty-wildflower-ah7znvaj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Configuration - Generate a strong secret
JWT_SECRET=your-super-secret-jwt-key-make-this-very-long-and-random-unique

# Frontend URL for CORS - Replace with your actual Vercel URL
FRONTEND_URL=https://ai-interview-trainer-five.vercel.app

# OpenAI API Key (optional)
OPENAI_API_KEY=your-openai-api-key-here
```

### Step 2: Build Command
```
npm install
```

### Step 3: Start Command
```
node server.js
```

## Frontend Deployment (Vercel)

### Step 1: Update API URL
The frontend should already be configured to point to your Render backend URL. If not, update `client/src/api/index.js`:

```javascript
baseURL: 'https://ai-interview-trainer-server.onrender.com/api'
```

### Step 2: Deploy
- Connect your GitHub repository to Vercel
- Vercel will automatically detect it's a React app and build it

## Database Setup (Neon)

### Step 1: Create Database
1. Sign up at [Neon.tech](https://neon.tech)
2. Create a new project
3. Note the connection string

### Step 2: Run Migrations
The application should automatically create tables when it starts. If not, run the SQL from `ai_interview_trainer.session.sql`.

## Common Issues and Solutions

### Issue 1: "Invalid credentials" error
**Cause**: JWT secret mismatch or CORS issues
**Solution**: 
1. Ensure `JWT_SECRET` is the same in both environments
2. Check `FRONTEND_URL` matches your Vercel deployment
3. Clear browser localStorage and try again

### Issue 2: Database connection errors
**Cause**: Incorrect DATABASE_URL or Neon configuration
**Solution**:
1. Verify your Neon connection string
2. Ensure `sslmode=require` is included
3. Check Neon dashboard for connection issues

### Issue 3: CORS errors
**Cause**: Frontend URL not whitelisted
**Solution**:
1. Set correct `FRONTEND_URL` environment variable
2. Restart the backend service

### Issue 4: Static file serving errors
**Cause**: Backend trying to serve frontend files
**Solution**: 
The backend has been configured to NOT serve static files since frontend is separate.

## Testing the Deployment

### Test Backend Health
Visit: `https://ai-interview-trainer-server.onrender.com/api/health`

Expected response:
```json
{
  "status": "OK",
  "message": "AI Interview Trainer API is running",
  "db": "connected",
  "timestamp": "2025-11-08T07:00:00.000Z"
}
```

### Test Authentication
1. Go to your Vercel frontend URL
2. Try signing up with a new account
3. Try logging in with the demo credentials:
   - Email: demo@example.com
   - Password: demopassword123

## Demo Credentials
For testing purposes, you can use:
- **Email**: demo@example.com
- **Password**: demopassword123

## Troubleshooting

### Check Server Logs
1. Go to Render dashboard
2. View your service logs
3. Look for any error messages

### Check Browser Console
1. Open browser developer tools
2. Check Network tab for API calls
3. Check Console for JavaScript errors

### Reset Database
If needed, you can reset your database by:
1. Going to Neon dashboard
2. Creating a new database
3. Updating the DATABASE_URL environment variable
4. Restarting the backend service

## Support
If you continue to experience issues:
1. Check the server logs on Render
2. Verify all environment variables are set correctly
3. Ensure CORS is properly configured
4. Test the health endpoint to verify database connection
