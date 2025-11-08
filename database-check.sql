-- SQL queries to check if the database is working correctly

-- 1. Check if questions table exists and has data
SELECT COUNT(*) as total_questions FROM questions;

-- 2. Check questions by subject and difficulty
SELECT subject, difficulty, COUNT(*) as count 
FROM questions 
GROUP BY subject, difficulty 
ORDER BY subject, difficulty;

-- 3. Sample questions to verify data
SELECT id, subject, difficulty, content 
FROM questions 
WHERE subject = 'java' AND difficulty = 'easy'
LIMIT 5;

-- 4. Check if interview_questions table exists (this might be causing the issue)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%interview%';

-- 5. Check users table
SELECT COUNT(*) as total_users FROM users;

-- 6. Check interviews table  
SELECT COUNT(*) as total_interviews FROM interviews;
